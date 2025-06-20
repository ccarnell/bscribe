// /app/api/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { priceId } = body; // Now expects actual Stripe price ID
    
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId, // Use your actual Stripe price IDs
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.NEXT_PUBLIC_SITE_URL,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}