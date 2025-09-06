import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Voice limit checking endpoint for Vapi integration

// Initialize Supabase client
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'UserId is required' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Get user's subscription plan
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('subscription_plan')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const plan = user.subscription_plan || 'free';

    // Get plan limits
    const { data: planLimits, error: planError } = await supabase
      .from('plan_limits')
      .select('max_voice_minutes_per_month, can_use_voice')
      .eq('plan_name', plan)
      .single();

    if (planError || !planLimits) {
      return NextResponse.json(
        { error: 'Plan limits not found' },
        { status: 404 }
      );
    }

    // Check if voice is enabled for this plan
    if (!planLimits.can_use_voice) {
      return NextResponse.json({
        allowed: false,
        currentUsage: 0,
        maxUsage: 0,
        plan,
        reason: 'voice_disabled',
        message: `Voice calls are not available on the ${plan} plan. Please upgrade to use voice features.`
      });
    }

    // Get current period's usage (use subscription period start instead of calendar month)
    const now = new Date();
    
    // Get user's subscription period start for monthly billing cycle
    const { data: userData } = await supabase
      .from('users')
      .select('current_period_start')
      .eq('id', userId)
      .single();
    
    let resetDate;
    if (userData?.current_period_start) {
      // Use subscription period start date
      resetDate = new Date(userData.current_period_start).toISOString().split('T')[0];
    } else {
      // Fallback to calendar month for free users
      resetDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    }

    const { data: usage } = await supabase
      .from('subscription_usage')
      .select('usage_count')
      .eq('user_id', userId)
      .eq('feature_name', 'voice_minutes')
      .eq('reset_date', resetDate)
      .single();

    const currentUsage = usage?.usage_count || 0;
    const maxUsage = planLimits.max_voice_minutes_per_month;

    // Check if user has exceeded their limit
    if (maxUsage !== -1 && currentUsage >= maxUsage) {
      return NextResponse.json({
        allowed: false,
        currentUsage,
        maxUsage,
        plan,
        reason: 'limit_exceeded',
        message: `You've reached your monthly voice limit of ${maxUsage} minutes for the ${plan} plan. Please upgrade to continue using voice calls.`
      });
    }

    return NextResponse.json({
      allowed: true,
      currentUsage,
      maxUsage,
      plan,
      reason: 'allowed',
      message: `You have ${maxUsage - currentUsage} voice minutes remaining this month.`
    });

  } catch (error) {
    console.error('Error checking voice limits:', error);
    return NextResponse.json(
      { error: 'Failed to check voice limits' },
      { status: 500 }
    );
  }
}
