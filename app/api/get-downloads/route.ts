// app/api/get-downloads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/config';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY_OVERRIDE!
);

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Get session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Get the price ID to determine what was purchased
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
    const priceId = lineItems.data[0]?.price?.id;
    
    console.log('Purchase session:', sessionId, 'Price ID:', priceId);
    
    const downloads = [];
    
    // Determine what to download based on price ID
    switch (priceId) {
      // INDIVIDUAL BOOK PURCHASES ($4.20, $6.66, $9.11)
      case 'price_1RbncaQ4YMiPgiVCZCEpkMZz': // $4.20
      case 'price_1RbndXQ4YMiPgiVCkDZvB3IP': // $6.66  
      case 'price_1RbnegQ4YMiPgiVC0lqM3iIT': // $9.11
        console.log('Individual purchase detected');
        downloads.push({
          url: '/api/file-proxy?path=individual/book-1-millionaire-mindset-acovado-toast.pdf',
          filename: 'millionaire-mindset.pdf'
        });
        break;
        
      // BUNDLE PURCHASES ($13.37, $90.01) - BOTH BOOKS
      case 'price_1Rbnl9Q4YMiPgiVCYDyjHT79': // $13.37
      case 'price_1RbnlMQ4YMiPgiVCSSqCt9o6': // $90.01
        console.log('Bundle purchase detected - adding both files');
        
        // Get the free book filename dynamically
        const { data: freeFiles } = await supabaseAdmin.storage
          .from('books')
          .list('free');
        
        if (freeFiles && freeFiles.length > 0) {
          downloads.push({
            url: `/api/file-proxy?path=free/${freeFiles[0].name}`,
            filename: 'free-book.pdf'
          });
        }
        
        // Add the paid book
        downloads.push({
          url: '/api/file-proxy?path=individual/book-1-millionaire-mindset-acovado-toast.pdf',
          filename: 'millionaire-mindset.pdf'
        });
        break;
        
      default:
        console.log('Unknown price ID:', priceId);
        return NextResponse.json({ error: 'Unknown purchase type' }, { status: 400 });
    }
    
    console.log(`Returning ${downloads.length} downloads:`, downloads.map(d => d.filename));
    
    // Log each download to download_logs table
    try {
      const customerEmail = session.customer_details?.email || null;
      
      for (const download of downloads) {
        await supabaseAdmin
          .from('download_logs')
          .insert({
            session_id: sessionId,
            book_title: download.filename.replace('.pdf', '').replace('-', ' '),
            customer_email: customerEmail,
            downloaded_at: new Date().toISOString()
          });
      }
      
      console.log(`✅ Logged ${downloads.length} downloads for customer: ${customerEmail}`);
    } catch (logError) {
      console.error('Failed to log downloads:', logError);
      // Continue anyway - downloads are more important than logging
    }
    
    return NextResponse.json({ 
      downloads,
      purchaseType: downloads.length > 1 ? 'bundle' : 'individual',
      customerEmail: session.customer_details?.email || null
    });
    
  } catch (error) {
    console.error('Get downloads error:', error);
    return NextResponse.json({ error: 'Failed to get downloads' }, { status: 500 });
  }
}
