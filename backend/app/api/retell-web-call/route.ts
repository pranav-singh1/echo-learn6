import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Resolve agent id from multiple env names, then fall back to body if needed
    const envAgentId =
      process.env.RETELL_AGENT_ID ||
      process.env.REACT_APP_RETELL_AGENT_ID ||
      process.env.NEXT_PUBLIC_RETELL_AGENT_ID;

    let agent_id = envAgentId;
    if (!agent_id) {
      // graceful fallback: allow body-provided agent_id in non-prod/dev setups
      const maybeBody = await request.json().catch(() => null as unknown);
      agent_id = (maybeBody as any)?.agent_id;
    }

    if (!agent_id) {
      return NextResponse.json({ error: 'RETELL_AGENT_ID not configured' }, { status: 500 });
    }

    const retellApiKey = process.env.RETELL_API_KEY;
    if (!retellApiKey) {
      return NextResponse.json({ error: 'RETELL_API_KEY not configured' }, { status: 500 });
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