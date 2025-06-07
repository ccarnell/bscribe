import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/config';
import { getURL } from '@/utils/helpers';

// app/api/create-checkout/route.ts
export async function POST(request: NextRequest) {
  try {
    const { priceId, bookTitle, productId } = await request.json();

    // Validate price - ensure it's one of our expected price points
    const validPrices = [420, 666, 911, 1337, 9001, 999, 1299, 799, 1499, 1199, 899, 3999];
    const unitAmount = typeof priceId === 'number' && validPrices.includes(priceId)
      ? priceId
      : 699; // Default to lowest price if invalid

    // Create session with validated price
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: bookTitle,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${getURL()}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: getURL(),
      metadata: {
        bookTitle: bookTitle,
        productId: productId,
        originalPrice: unitAmount.toString(), // Track which price was selected
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