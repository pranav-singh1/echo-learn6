import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null;

export async function POST(request: NextRequest) {
  try {
    const { feature, userId } = await request.json();

    if (!feature || !userId) {
      return NextResponse.json(
        { error: 'Feature and userId are required' },
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
      .select('*')
      .eq('plan_name', plan)
      .single();

    if (planError || !planLimits) {
      return NextResponse.json(
        { error: 'Plan limits not found' },
        { status: 404 }
      );
    }

    // Check if feature is enabled for this plan
    let featureEnabled: boolean;
    if (feature === 'quiz_generations') {
      featureEnabled = !!planLimits.can_use_quiz;
    } else if (feature === 'voice_minutes') {
      featureEnabled = !!planLimits.can_use_voice;
    } else if (feature === 'messages') {
      // Chat is available on all plans by default
      featureEnabled = true;
    } else {
      featureEnabled = true;
    }
    
    if (!featureEnabled) {
      return NextResponse.json({
        allowed: false,
        reason: 'feature_not_available',
        message: `This feature is not available in your ${plan} plan. Please upgrade to use ${feature}.`
      });
    }

    // Determine reset period: daily for quizzes, monthly for others
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const isDailyFeature = feature === 'quiz_generations';
    const resetDate = isDailyFeature ? currentDate : monthStart;
    const featureName = feature === 'quiz_generations' ? 'quiz_generations' : feature;
    const { data: usage } = await supabase
      .from('subscription_usage')
      .select('usage_count')
      .eq('user_id', userId)
      .eq('feature_name', featureName)
      .eq('reset_date', resetDate)
      .single();

    const currentUsage = usage?.usage_count || 0;
    
    // Handle different limit types based on feature
    let maxUsage;
    if (feature === 'quiz_generations') {
      // Use daily limit from DB (e.g., 10 per day), not unlimited
      maxUsage = planLimits.max_quiz_generations_per_day;
    } else {
      maxUsage = planLimits[`max_${feature}_per_month`];
    }

    // Check if unlimited (-1) or within limits
    const isUnlimited = maxUsage === -1;
    const withinLimits = isUnlimited || currentUsage < maxUsage;

    return NextResponse.json({
      allowed: withinLimits,
      currentUsage,
      maxUsage: isUnlimited ? 'unlimited' : maxUsage,
      plan,
      reason: withinLimits ? 'within_limits' : 'usage_exceeded',
      message: withinLimits 
        ? 'Feature usage allowed'
        : feature === 'quiz_generations'
        ? `You've reached your daily quiz generation limit for the ${plan} plan. Please try again tomorrow or upgrade to generate more quizzes.`
        : `You've reached your monthly limit for ${feature}. Please upgrade your plan for more usage.`
    });

  } catch (error) {
    console.error('Error checking limits:', error);
    return NextResponse.json(
      { error: 'Failed to check limits' },
      { status: 500 }
    );
  }
} 