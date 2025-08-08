import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { feature, userId } = await request.json();

    if (!feature || !userId) {
      return NextResponse.json(
        { error: 'Feature and userId are required' },
        { status: 400 }
      );
    }

    const currentDate = new Date().toISOString().split('T')[0];

    // Upsert usage record (increment existing or create new)
    const { data, error } = await supabase
      .from('subscription_usage')
      .upsert({
        user_id: userId,
        feature_name: feature,
        usage_count: 1,
        reset_date: currentDate,
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