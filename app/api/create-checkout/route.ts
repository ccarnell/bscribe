// /app/api/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { priceId, bookTitle, productId } = body;
    
    // Map your simple price amounts to Stripe metadata
    let stripeProductId = '';
    
    if (productId === 'prod_paid_book_1') {
      stripeProductId = 'prod_SWrLr7RbHWgihN'; // Your millionaire book
    } else if (productId === 'prod_bundle') {
      stripeProductId = 'prod_SWrUikM8AGR3kP'; // Your bundle
    }

    // Create session with simple price amount
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product: stripeProductId,
          unit_amount: priceId, // Your price in cents (420, 666, etc.)
        },
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.NEXT_PUBLIC_SITE_URL,
      metadata: {
        productId: productId,
        bookTitle: bookTitle,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}