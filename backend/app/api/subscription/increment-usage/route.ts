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
    const { feature, userId, amount } = await request.json();

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

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];

    const isDailyFeature = feature === 'quiz_generations';
    const resetDate = isDailyFeature ? currentDate : monthStart;

    const incrementBy = typeof amount === 'number' && amount > 0 ? amount : 1;

    // Try to get current row
    const { data: existing } = await supabase
      .from('subscription_usage')
      .select('usage_count')
      .eq('user_id', userId)
      .eq('feature_name', feature)
      .eq('reset_date', resetDate)
      .single();

    let newCount = incrementBy;
    if (existing && typeof existing.usage_count === 'number') {
      newCount = existing.usage_count + incrementBy;
    }

    // Upsert with updated count
    const { data, error } = await supabase
      .from('subscription_usage')
      .upsert({
        user_id: userId,
        feature_name: feature,
        usage_count: newCount,
        reset_date: resetDate,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,feature_name,reset_date',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error incrementing usage:', error);
      return NextResponse.json(
        { error: 'Failed to increment usage' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      newUsage: data.usage_count
    });

  } catch (error) {
    console.error('Error incrementing usage:', error);
    return NextResponse.json(
      { error: 'Failed to increment usage' },
      { status: 500 }
    );
  }
} 