import Stripe from 'stripe';

// Initialize Stripe with your secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51RiOu6G7b7Dpici2f1uyYjcaSQhSL4G5ql5X8SGCo6cK5vmEMo79c3WXdAVfHfJROIgWYShTSTnVbOu1s4EBgHR100BXGbWmOA', {
  apiVersion: '2025-07-30.basil',
});

// Your domain for redirects
export const YOUR_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Price lookup keys - replace with your actual Stripe price lookup keys
export const PRICE_LOOKUP_KEYS = {
  MONTHLY: 'price_1RnsRsG7b7Dpici2keGXRJCE',
  YEARLY: 'price_1RsKEcG7b7Dpici2IKKgOPhH',
};

// Product configuration
export const PRODUCTS = {
  MONTHLY: {
    name: 'EchoLearn Pro Monthly',
    price: '$9.99',
    lookup_key: PRICE_LOOKUP_KEYS.MONTHLY,
  },
  YEARLY: {
    name: 'EchoLearn Pro Yearly', 
    price: '$89.99',
    lookup_key: PRICE_LOOKUP_KEYS.YEARLY,
  },
}; 