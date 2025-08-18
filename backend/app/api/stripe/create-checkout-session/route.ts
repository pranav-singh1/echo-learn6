import { NextRequest, NextResponse } from 'next/server';
import { stripe, YOUR_DOMAIN } from '../../../../lib/stripe';
import { createClient } from '@supabase/supabase-js';

async function resolvePriceId(input: string): Promise<string> {
  // If the input looks like a real Stripe price id (alphanumeric only after prefix), use it directly
  // This avoids treating aliases like `price_pro_monthly` as real IDs
  if (/^price_[A-Za-z0-9]{10,}$/.test(input)) {
    return input;
  }

  // Map known alias keys to env-provided price ids (read at request time)
  const proMonthly = process.env.STRIPE_PRICE_PRO_MONTHLY;
  const proYearly = process.env.STRIPE_PRICE_PRO_YEARLY;
  const aliasMap: Record<string, string | undefined> = {
    price_pro_monthly: proMonthly,
    price_pro_yearly: proYearly,
    pro_monthly: proMonthly,
    pro_yearly: proYearly,
  };

  const mapped = aliasMap[input];
  if (mapped && /^price_/.test(mapped)) {
    return mapped;
  }

  // As a last resort, try resolving via Stripe lookup_keys
  const prices = await stripe.prices.list({ lookup_keys: [input], limit: 1 });
  if (prices.data.length > 0) {
    return prices.data[0].id;
  }

  throw new Error(`Unable to resolve price for key: ${input}`);
}

// Initialize Supabase client
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null;

export async function POST(request: NextRequest) {
  try {
    // Check for authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required. Please log in to subscribe.' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token with Supabase if available
    if (supabase) {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
          return NextResponse.json({ error: 'Invalid authentication token. Please log in again.' }, { status: 401 });
        }
      } catch (error) {
        return NextResponse.json({ error: 'Authentication verification failed. Please log in again.' }, { status: 401 });
      }
    } else {
      // If Supabase is not configured, just check that a token was provided
      console.warn('Supabase not configured - authentication check limited');
    }

    const { lookup_key, plan } = await request.json();

    const key = lookup_key || plan;
    if (!key) {
      return NextResponse.json({ error: 'Missing lookup_key or plan' }, { status: 400 });
    }

    const priceId = await resolvePriceId(String(key));

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
      metadata: {
        product_name: 'EchoLearn Pro',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}