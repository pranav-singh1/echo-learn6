import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { call_id } = await request.json();

    if (!call_id) {
      return NextResponse.json({ error: 'call_id is required' }, { status: 400 });
    }

    const retellApiKey = process.env.RETELL_API_KEY;
    if (!retellApiKey) {
      return NextResponse.json({ error: 'RETELL_API_KEY not configured' }, { status: 500 });
    }

    const response = await fetch(`https://api.retellai.com/v2/get-call/${call_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${retellApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Retell API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get call details', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error getting Retell call details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 