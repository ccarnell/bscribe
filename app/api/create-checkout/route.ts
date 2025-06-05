import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/config';
import { getURL } from '@/utils/helpers';

// app/api/create-checkout/route.ts
export async function POST(request: NextRequest) {
  try {
    const { priceId, bookTitle, productId } = await request.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: bookTitle,
            },
            unit_amount: priceId,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${getURL()}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: getURL(),
      metadata: {
        bookTitle: bookTitle,
        productId: productId // Add this
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