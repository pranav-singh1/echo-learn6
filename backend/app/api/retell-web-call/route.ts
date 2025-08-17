import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (service role for server-side checks)
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null;

export async function POST(request: NextRequest) {
  try {
    // Parse body once (may be empty)
    const bodyJson = await request.json().catch(() => ({} as any));

    // Resolve agent id from multiple env names, then fall back to body if needed
    const envAgentId =
      process.env.RETELL_AGENT_ID ||
      process.env.REACT_APP_RETELL_AGENT_ID ||
      process.env.NEXT_PUBLIC_RETELL_AGENT_ID;

    const agent_id = envAgentId || bodyJson?.agent_id;

    if (!agent_id) {
      return NextResponse.json({ error: 'RETELL_AGENT_ID not configured' }, { status: 500 });
    }

    const retellApiKey = process.env.RETELL_API_KEY;
    if (!retellApiKey) {
      return NextResponse.json({ error: 'RETELL_API_KEY not configured' }, { status: 500 });
    }

    const userId: string | undefined = bodyJson?.userId;

    // Enforce voice minutes limit before starting the call
    if (userId && supabase) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('subscription_plan')
        .eq('id', userId)
        .single();

      if (!userError && user) {
        const plan = user.subscription_plan || 'free';
        const { data: planLimits } = await supabase
          .from('plan_limits')
          .select('max_voice_minutes_per_month')
          .eq('plan_name', plan)
          .single();

        if (planLimits) {
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString()
            .split('T')[0];
          const { data: usage } = await supabase
            .from('subscription_usage')
            .select('usage_count')
            .eq('user_id', userId)
            .eq('feature_name', 'voice_minutes')
            .eq('reset_date', monthStart)
            .single();

          const currentMinutes = usage?.usage_count || 0;
          const maxMinutes = planLimits.max_voice_minutes_per_month;

          if (maxMinutes !== -1 && currentMinutes >= maxMinutes) {
            return NextResponse.json(
              { error: `You've reached your monthly voice minutes for the ${plan} plan. Please upgrade to continue using voice.` },
              { status: 403 }
            );
          }
        }
      }
    }

    const response = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${retellApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Retell API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create web call', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating Retell web call:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}