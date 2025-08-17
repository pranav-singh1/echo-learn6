import { NextRequest, NextResponse } from 'next/server';
import { stripe, YOUR_DOMAIN, PRICE_LOOKUP_KEYS } from '../../../../lib/stripe';

async function resolvePriceId(input: string): Promise<string> {
  // If the input looks like a real Stripe price id, use it directly
  if (/^price_/.test(input) && input.length > 10) {
    return input;
  }

  // Map known alias keys to env-provided price ids
  const aliasMap: Record<string, string | undefined> = {
    price_pro_monthly: PRICE_LOOKUP_KEYS.PRO_MONTHLY,
    price_pro_yearly: PRICE_LOOKUP_KEYS.PRO_YEARLY,
    pro_monthly: PRICE_LOOKUP_KEYS.PRO_MONTHLY,
    pro_yearly: PRICE_LOOKUP_KEYS.PRO_YEARLY,
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

export async function POST(request: NextRequest) {
  try {
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