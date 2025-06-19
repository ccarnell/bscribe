import Stripe from 'stripe';

// Use test key in development, live key in production
const stripeSecretKey = process.env.NODE_ENV === 'production' 
  ? (process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY || '')
  : (process.env.STRIPE_SECRET_KEY || '');

export const stripe = new Stripe(
  stripeSecretKey,
  {
    // @ts-ignore
    apiVersion: null,
    appInfo: {
      name: 'Next.js Subscription Starter',
      version: '0.0.0',
      url: 'https://github.com/vercel/nextjs-subscription-payments'
    }
  }
);