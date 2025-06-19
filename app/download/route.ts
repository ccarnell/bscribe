import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/config';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json({ error: 'No session ID provided' }, { status: 400 });
    }

    // Verify with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price.product']
    });
    
    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Invalid or unpaid session' }, { status: 400 });
    }

    // Get product details from Stripe
    const lineItem = session.line_items?.data[0];
    const stripeProduct = lineItem?.price?.product as any;
    const stripeProductId = stripeProduct?.id;
    
    console.log('Stripe product ID:', stripeProductId);
    
    // Look up our product in the database
    const supabase = createClient();
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('stripe_product_id', stripeProductId)
      .single();
    
    if (productError || !product) {
      console.error('Product lookup error:', productError);
      return NextResponse.json({ 
        error: 'Product not found',
        details: `No product found for Stripe ID: ${stripeProductId}`
      }, { status: 404 });
    }
    
    // Handle bundle vs single product
    if (product.is_bundle) {
      // Get all items in the bundle
      const { data: bundleItems, error: bundleError } = await supabase
        .from('bundle_items')
        .select('*')
        .eq('bundle_product_id', product.id)
        .order('display_order');
      
      if (bundleError) {
        console.error('Bundle items error:', bundleError);
        return NextResponse.json({ error: 'Failed to load bundle contents' }, { status: 500 });
      }
      
      // Return multiple download URLs
      const downloads = bundleItems?.map(item => ({
        title: item.title,
        downloadUrl: `/api/file-proxy?path=${encodeURIComponent(item.file_path)}`
      })) || [];
      
      return NextResponse.json({
        success: true,
        isBundle: true,
        bookTitle: product.title,
        downloads,
        sessionId
      });
    } else {
      // Single product
      return NextResponse.json({
        success: true,
        isBundle: false,
        downloadUrl: `/api/file-proxy?path=${encodeURIComponent(product.file_path)}`,
        bookTitle: product.title,
        sessionId
      });
    }

  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json({ 
      error: 'Failed to process download',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}