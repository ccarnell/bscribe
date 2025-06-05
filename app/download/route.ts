import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/config';
import { createClient } from '@/utils/supabase/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json({ error: 'No session ID provided' }, { status: 400 });
    }

    const supabase = createClient();

    // First check if we already have a purchase record with access token
    const { data: existingPurchase, error: fetchError } = await supabase
      .from('purchases')
      .select(`
        *,
        products (
          id,
          title,
          slug
        )
      `)
      .eq('stripe_payment_intent_id', sessionId)
      .single();

    if (existingPurchase?.access_token) {
      // Return existing access token
      return NextResponse.json({
        success: true,
        accessToken: existingPurchase.access_token,
        bookTitle: existingPurchase.products?.title || 'Your Book',
        downloadUrl: `/download/${existingPurchase.access_token}`
      });
    }

    // If no purchase record exists, verify with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Invalid or unpaid session' }, { status: 400 });
    }

    // Generate permanent access token
    const accessToken = crypto.randomBytes(32).toString('hex');
    
    // Create new purchase record
    const { data: newPurchase, error: insertError } = await supabase
      .from('purchases')
      .insert({
        product_id: session.metadata?.productId || 'prod_bundle', // Default to bundle if not specified
        stripe_payment_intent_id: session.payment_intent as string,
        amount_cents: session.amount_total || 0,
        status: 'succeeded',
        access_token: accessToken,
        buyer_id: null // Guest checkout
      })
      .select(`
        *,
        products (
          id,
          title,
          slug
        )
      `)
      .single();

    if (insertError) {
      console.error('Failed to create purchase record:', insertError);
      return NextResponse.json({ 
        error: 'Failed to create purchase record',
        details: insertError.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      accessToken,
      bookTitle: newPurchase?.products?.title || session.metadata?.bookTitle || 'Your Book',
      downloadUrl: `/download/${accessToken}`
    });

  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json(
      { error: 'Failed to process download request' },
      { status: 500 }
    );
  }
}