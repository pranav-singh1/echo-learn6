import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { agent_id } = await request.json();
  const apiKey = process.env.RETELL_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'RETELL_API_KEY not set' }, { status: 500 });
  }
  if (!agent_id) {
    return NextResponse.json({ error: 'agent_id is required' }, { status: 400 });
  }

  try {
    const retellRes = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        agent_id,
        call_type: 'web_call',
      }),
    });

    if (!retellRes.ok) {
      const error = await retellRes.text();
      return NextResponse.json({ error }, { status: retellRes.status });
    }

    const data = await retellRes.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
} 