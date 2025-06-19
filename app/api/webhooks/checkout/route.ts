// app/api/webhooks/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/config';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY_OVERRIDE!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    
    // Generate access token
    const accessToken = crypto.randomBytes(32).toString('hex');
    
    // Create purchase record
    const { error } = await supabaseAdmin
      .from('purchases')
      .insert({
        buyer_id: session.customer, // or null if guest
        product_id: session.metadata.productId,
        stripe_payment_intent_id: session.payment_intent,
        amount_cents: session.amount_total,
        status: 'succeeded',
        access_token: accessToken
      });

    if (error) {
      console.error('Failed to create purchase record:', error);
    }
  }

  return NextResponse.json({ received: true });
}