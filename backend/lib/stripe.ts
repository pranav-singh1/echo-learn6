import Stripe from 'stripe';

// Initialize Stripe with your secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51RiOu6G7b7Dpici2f1uyYjcaSQhSL4G5ql5X8SGCo6cK5vmEMo79c3WXdAVfHfJROIgWYShTSTnVbOu1s4EBgHR100BXGbWmOA', {
  apiVersion: '2025-07-30.basil',
});

// Your domain for redirects
export const YOUR_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Price lookup keys - replace with your actual Stripe price lookup keys
export const PRICE_LOOKUP_KEYS = {
  PRO_MONTHLY: 'price_1RnsRsG7b7Dpici2keGXRJCE', // Replace with actual price ID from Stripe
  PRO_YEARLY: 'price_1RsKEcG7b7Dpici2IKKgOPhH',   // Replace with actual price ID from Stripe
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