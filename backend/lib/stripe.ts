import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set. Please configure it in your environment.');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-07-30.basil',
});

// Your domain for redirects
export const YOUR_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';

// Price lookup keys - replace with your actual Stripe price lookup keys
export const PRICE_LOOKUP_KEYS = {
  PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
  PRO_YEARLY: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
};

// Product configuration
export const PRODUCTS = {
  PRO: {
    name: 'EchoLearn Pro',
    description: 'For serious learners and students',
    monthly: {
      price: '$9.99',
      lookup_key: PRICE_LOOKUP_KEYS.PRO_MONTHLY,
      plan_name: 'pro'
    },
    yearly: {
      price: '$89.99',
      lookup_key: PRICE_LOOKUP_KEYS.PRO_YEARLY,
      plan_name: 'pro'
    }
  }
};

// Plan limits configuration
export const PLAN_LIMITS = {
  free: {
    max_voice_minutes_per_month: 50,
    max_messages_per_month: 300,
    max_quiz_generations_per_day: 3,
    can_use_voice: true,
    can_use_quiz: true,
    can_use_summary: true,
    can_use_blurting: true,
    can_use_teaching: true,
  },
  pro: {
    max_voice_minutes_per_month: 150,
    max_messages_per_month: 900,
    max_quiz_generations_per_day: 10,
    can_use_voice: true,
    can_use_quiz: true,
    can_use_summary: true,
    can_use_blurting: true,
    can_use_teaching: true,
  },
}; 