import { NextRequest, NextResponse } from 'next/server';
import { stripe, YOUR_DOMAIN } from '../../../../lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { lookup_key } = await request.json();

    if (!lookup_key) {
      return NextResponse.json(
        { error: 'Lookup key is required' },
        { status: 400 }
      );
    }

    // Create checkout session directly with price ID
    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      line_items: [
        {
          price: lookup_key, // Use the price ID directly
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
      metadata: {
        // Add any metadata you want to track
        product_name: 'EchoLearn Pro',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 