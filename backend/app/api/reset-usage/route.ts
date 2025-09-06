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

    // Delete all usage records for this user
    const { error } = await supabase
      .from('subscription_usage')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error resetting usage data:', error);
      return NextResponse.json(
        { error: 'Failed to reset usage data' },
        { status: 500 }
      );
    }

    console.log(`✅ Reset usage data for user: ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Usage data reset successfully'
    });

  } catch (error) {
    console.error('Error in reset-usage API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
