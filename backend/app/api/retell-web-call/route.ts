import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get agent_id from environment variable instead of request body for security
    const agent_id = process.env.RETELL_AGENT_ID || process.env.REACT_APP_RETELL_AGENT_ID;

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
        'Authorization': `Bearer ${retellApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: agent_id,
        // You can add metadata and retell_llm_dynamic_variables here if needed
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 