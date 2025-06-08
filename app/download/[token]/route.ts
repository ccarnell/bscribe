import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const PRODUCT_TO_FILE_MAP: { [key: string]: string } = {
  'prod_book_1': 'individual/book-1-seven-secrets.pdf',
  'prod_book_2': 'individual/book-2-navy-seal-ceo.pdf',
  'prod_book_3': 'individual/book-3-broke-to-billionaire.pdf',
  'prod_book_4': 'individual/book-4-deep-learning.pdf',
  'prod_book_5': 'individual/book-5-personal-brand.pdf',
  'prod_book_6': 'individual/book-6-zero-shot.pdf',
  'prod_bundle': 'bundles/bscribe-complete-bundle.pdf'
};

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = createClient();
    
    // Look up purchase by access token
    const { data: purchase, error } = await supabase
      .from('purchases')
      .select(`
        *,
        products (
          id,
          title,
          slug
        )
      `)
      .eq('access_token', params.token)
      .single();

    if (error || !purchase) {
      // Return a nice error page instead of JSON
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Download Link - BScribe</title>
          <style>
            body {
              background: #000;
              color: #fff;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .container {
              text-align: center;
              max-width: 500px;
            }
            h1 {
              color: #10b981;
              margin-bottom: 20px;
            }
            p {
              color: #9ca3af;
              line-height: 1.6;
              margin-bottom: 30px;
            }
            a {
              color: #10b981;
              text-decoration: none;
              font-weight: 600;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Invalid Download Link</h1>
            <p>This download link is invalid or has expired.</p>
            <p>If you recently made a purchase, please check your email for the correct download link.</p>
            <p>Need help? Contact us at <a href="mailto:support@bscribe.ai">support@bscribe.ai</a></p>
            <p style="margin-top: 40px;">
              <a href="/">← Back to Homepage</a>
            </p>
          </div>
        </body>
        </html>`,
        { 
          status: 404, 
          headers: { 'Content-Type': 'text/html' } 
        }
      );
    }

    // Update download count
    const currentCount = purchase.download_count || 0;
    await supabase
      .from('purchases')
      .update({
        download_count: currentCount + 1,
        last_downloaded_at: new Date().toISOString()
      })
      .eq('id', purchase.id);

    // Get file path from product_id
    const filePath = PRODUCT_TO_FILE_MAP[purchase.product_id];
    
    if (!filePath) {
      console.error(`No file mapping for product_id: ${purchase.product_id}`);
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Product Not Found - BScribe</title>
          <style>
            body {
              background: #000;
              color: #fff;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .container {
              text-align: center;
              max-width: 500px;
            }
            h1 {
              color: #ef4444;
              margin-bottom: 20px;
            }
            p {
              color: #9ca3af;
              line-height: 1.6;
              margin-bottom: 30px;
            }
            a {
              color: #10b981;
              text-decoration: none;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Product File Not Found</h1>
            <p>We couldn't find the file for this product. This is our fault!</p>
            <p>Please contact <a href="mailto:support@bscribe.ai">support@bscribe.ai</a> and we'll sort this out immediately.</p>
            <p>Your purchase is valid - we just need to fix the file link.</p>
          </div>
        </body>
        </html>`,
        { 
          status: 404, 
          headers: { 'Content-Type': 'text/html' } 
        }
      );
    }

    // Log successful download
    console.log(`Download initiated for product ${purchase.product_id} - Download #${currentCount + 1}`);

    // Use our new file proxy for more reliable downloads
    const proxyUrl = `/api/file-proxy?path=${encodeURIComponent(filePath)}`;
    console.log(`Using file proxy: ${proxyUrl}`);

    // Redirect to the proxy URL
    return NextResponse.redirect(proxyUrl);
    
  } catch (error) {
    console.error('Download error:', error);
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Error - BScribe</title>
        <style>
          body {
            background: #000;
            color: #fff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
          }
          .container {
            text-align: center;
          }
          h1 {
            color: #ef4444;
          }
          a {
            color: #10b981;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Something went wrong</h1>
          <p>Please contact <a href="mailto:support@bscribe.ai">support@bscribe.ai</a></p>
        </div>
      </body>
      </html>`,
      { 
        status: 500, 
        headers: { 'Content-Type': 'text/html' } 
      }
    );
  }
}