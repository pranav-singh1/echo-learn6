import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { callId } = await request.json();

    if (!callId) {
      return NextResponse.json(
        { error: 'Call ID is required' },
        { status: 400 }
      );
    }

    // Get Vapi private API key from environment
    const vapiPrivateKey = process.env.VAPI_PRIVATE_API_KEY;
    
    if (!vapiPrivateKey) {
      console.error('VAPI_PRIVATE_API_KEY environment variable not set');
      return NextResponse.json(
        { error: 'Vapi API key not configured on server' },
        { status: 500 }
      );
    }

    // Fetch call details from Vapi API
    const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${vapiPrivateKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch call data from Vapi API:', response.status);
      return NextResponse.json(
        { error: 'Failed to fetch call data from Vapi' },
        { status: response.status }
      );
    }

    const callData = await response.json();
    
    console.log('🔍 Raw call data from Vapi API:', {
      id: callData.id,
      startedAt: callData.startedAt,
      endedAt: callData.endedAt,
      status: callData.status,
      type: callData.type
    });
    
    // Return only the data we need for duration calculation
    return NextResponse.json({
      startedAt: callData.startedAt,
      endedAt: callData.endedAt,
      id: callData.id,
      status: callData.status
    });

  } catch (error) {
    console.error('Error in get-call API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
