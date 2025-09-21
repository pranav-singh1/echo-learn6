import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null;

function resolvePlanFromSubscription(subscription: any): string {
  try {
    const item = subscription?.items?.data?.[0];
    const price = item?.price;
    if (!price) return 'free';

    const envMonthlyId = process.env.STRIPE_PRICE_PRO_MONTHLY;
    const envYearlyId = process.env.STRIPE_PRICE_PRO_YEARLY;

    // 1) Prefer direct ID match with configured env price IDs
    if (price.id && (price.id === envMonthlyId || price.id === envYearlyId)) {
      return 'pro';
    }

    // 2) Fallback to lookup_key if present
    const lk = price.lookup_key as string | undefined;
    if (lk) {
      const normalized = lk.toLowerCase();
      if ([
        'price_pro_monthly',
        'pro_monthly',
        'price_pro_yearly',
        'pro_yearly',
      ].includes(normalized)) {
        return 'pro';
      }
    }

    return 'free';
  } catch {
    return 'free';
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // Check for authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    const { session_id } = await request.json();

    if (!session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription', 'subscription.items.data.price']
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    if (!session.subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 400 });
    }

    // Get the subscription details
    const subscription = session.subscription as any;
    
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Get customer email from Stripe
    const customer = await stripe.customers.retrieve(session.customer as string);
    
    if (!customer || customer.deleted) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const customerEmail = (customer as any).email;
    
    if (!customerEmail) {
      return NextResponse.json({ error: 'Customer email not found' }, { status: 400 });
    }

    // Verify the email matches the authenticated user
    if (user.email !== customerEmail) {
      return NextResponse.json({ error: 'Email mismatch' }, { status: 403 });
    }

    const plan = resolvePlanFromSubscription(subscription);

    // Update user subscription status in Supabase
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({
        stripe_customer_id: session.customer,
        subscription_id: subscription.id,
        subscription_status: subscription.status,
        subscription_plan: plan,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select();

    if (updateError) {
      console.error('Error updating user subscription:', updateError);
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }

    console.log(`Successfully verified and updated subscription for user ${user.id}: ${subscription.id}`);

    return NextResponse.json({ 
      success: true, 
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: plan,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end
      }
    });

  } catch (error) {
    console.error('Error verifying session:', error);
    const message = error instanceof Error ? error.message : 'Failed to verify session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
