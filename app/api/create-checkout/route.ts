// This bypasses the database and goes straight to Stripe

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/config';
import { getURL } from '@/utils/helpers';

export async function POST(request: NextRequest) {
  try {
    const { priceId, bookTitle } = await request.json();

    // Create Stripe checkout session directly
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: bookTitle,
              images: ['https://via.placeholder.com/300x400?text=Book+Cover'], // We'll replace this
            },
            unit_amount: priceId, // Price in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${getURL()}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: getURL(),
      metadata: {
        bookTitle: bookTitle,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}