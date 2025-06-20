import Stripe from 'stripe';
import { stripe } from '@/utils/stripe/config';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import {
  upsertProductRecord,
  upsertPriceRecord,
  manageSubscriptionStatusChange,
  deleteProductRecord,
  deletePriceRecord
} from '@/utils/supabase/admin';

// Add supabaseAdmin setup
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY_OVERRIDE!
);

function logPaymentEvent(event: string, data: any) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event: `stripe_${event}`,
    ...data
  }));
}

const relevantEvents = new Set([
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'product.created',
  'product.updated',
  'product.deleted',
  'price.created',
  'price.updated',
  'price.deleted',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted'
]);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret)
      return new Response('Webhook secret not found.', { status: 400 });
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log(`🔔  Webhook received: ${event.type}`);
  } catch (err: any) {
    console.log(`❌ Error message: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'product.created':
        case 'product.updated':
          await upsertProductRecord(event.data.object as Stripe.Product);
          break;
        case 'price.created':
        case 'price.updated':
          await upsertPriceRecord(event.data.object as Stripe.Price);
          break;
        case 'price.deleted':
          await deletePriceRecord(event.data.object as Stripe.Price);
          break;
        case 'product.deleted':
          await deleteProductRecord(event.data.object as Stripe.Product);
          break;
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          logPaymentEvent('payment_success', {
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            customer: paymentIntent.customer,
            metadata: paymentIntent.metadata
          });
          break;

        case 'payment_intent.payment_failed':
          const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
          logPaymentEvent('payment_failed', {
            amount: failedPaymentIntent.amount / 100,
            error: failedPaymentIntent.last_payment_error?.message
          });
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === 'customer.subscription.created'
          );
          break;
        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription;
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true
            );
          }
          
          // Handle one-time purchases
          if (checkoutSession.mode === 'payment') {
            // Get the line items to find the price ID
            const lineItems = await stripe.checkout.sessions.listLineItems(checkoutSession.id);
            const priceId = lineItems.data[0]?.price?.id;
            
            // Map price IDs to download types
            let downloadType = '';
            let productId = '';
            
            switch (priceId) {
              case 'price_1RbncaQ4YMiPgiVCZCEpkMZz': // $4.20
              case 'price_1RbndXQ4YMiPgiVCkDZvB3IP': // $6.66  
              case 'price_1RbnegQ4YMiPgiVC0lqM3iIT': // $9.11
                downloadType = 'individual';
                productId = 'prod_SWrLr7RbHWgihN';
                break;
              case 'price_1Rbnl9Q4YMiPgiVCYDyjHT79': // $13.37
              case 'price_1RbnlMQ4YMiPgiVCSSqCt9o6': // $90.01
                downloadType = 'bundle';
                productId = 'prod_SWrUikM8AGR3kP';
                break;
            }
            
            const accessToken = crypto.randomBytes(32).toString('hex');
            
            const { error } = await supabaseAdmin
              .from('purchases')
              .insert({
                buyer_id: checkoutSession.customer,
                product_id: productId,
                stripe_payment_intent_id: checkoutSession.payment_intent,
                amount_cents: checkoutSession.amount_total,
                status: 'succeeded',
                access_token: accessToken,
                download_type: downloadType
              });

            if (error) {
              console.error('Failed to create purchase record:', error);
            } else {
              console.log(`✅ Purchase record created: ${downloadType} for ${checkoutSession.customer}`);
            }
          }
          break;
        default:
          throw new Error('Unhandled relevant event!');
      }
    } catch (error) {
      console.log(error);
      return new Response(
        'Webhook handler failed. View your Next.js function logs.',
        {
          status: 400
        }
      );
    }
  } else {
    return new Response(`Unsupported event type: ${event.type}`, {
      status: 400
    });
  }
  return new Response(JSON.stringify({ received: true }));
}