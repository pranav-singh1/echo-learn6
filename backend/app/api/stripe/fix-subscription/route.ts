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

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log(`Fixing subscription for user: ${user.email}, provided email: ${email}`);

    // Verify email matches authenticated user
    if (user.email !== email) {
      return NextResponse.json({ error: 'Email does not match authenticated user' }, { status: 403 });
    }

    // Search for active subscriptions for this customer email in Stripe
    const customers = await stripe.customers.list({
      email: email,
      limit: 10
    });

    if (customers.data.length === 0) {
      return NextResponse.json({ error: 'No Stripe customer found with this email' }, { status: 404 });
    }

    let activeSubscription = null;
    let customerId = null;

    // Check each customer for active subscriptions
    for (const customer of customers.data) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 10
      });

      if (subscriptions.data.length > 0) {
        activeSubscription = subscriptions.data[0]; // Get the first active subscription
        customerId = customer.id;
        break;
      }
    }

    if (!activeSubscription) {
      return NextResponse.json({ error: 'No active subscription found in Stripe for this email' }, { status: 404 });
    }

    const plan = resolvePlanFromSubscription(activeSubscription);

    // Update user subscription status in Supabase
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({
        stripe_customer_id: customerId,
        subscription_id: activeSubscription.id,
        subscription_status: activeSubscription.status,
        subscription_plan: plan,
        current_period_start: new Date((activeSubscription as any).current_period_start * 1000).toISOString(),
        current_period_end: new Date((activeSubscription as any).current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select();

    if (updateError) {
      console.error('Error updating user subscription:', updateError);
      return NextResponse.json({ error: 'Failed to update subscription in database' }, { status: 500 });
    }

    console.log(`Successfully fixed subscription for user ${user.id}: ${activeSubscription.id}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription status fixed successfully',
      subscription: {
        id: activeSubscription.id,
        status: activeSubscription.status,
        plan: plan,
        current_period_start: (activeSubscription as any).current_period_start,
        current_period_end: (activeSubscription as any).current_period_end
      }
    });

  } catch (error) {
    console.error('Error fixing subscription:', error);
    const message = error instanceof Error ? error.message : 'Failed to fix subscription';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
