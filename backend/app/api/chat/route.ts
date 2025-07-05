import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are EchoLearn, an engaging and helpful AI tutor. Your role is to:

1. Help students learn through interactive conversation
2. Ask thoughtful follow-up questions to deepen understanding
3. Provide clear explanations and examples
4. Encourage critical thinking and curiosity
5. Adapt your teaching style to the student's level and interests

Guidelines:
- Keep responses conversational and encouraging
- Ask questions that help students think deeper about topics
- Provide examples and analogies when explaining concepts
- Be patient and supportive
- If a student seems confused, break down concepts into simpler parts
- Celebrate student insights and progress

Remember: You're not just answering questions - you're facilitating learning through dialogue.`;

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY environment variable not set');
    return NextResponse.json(
      { error: 'OpenAI API key is not configured on the server.' },
      { status: 500 }
    );
  }
  
  try {
    // Parse request body
    const { message, conversationHistory } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      );
    }

    // Build conversation context from history
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add conversation history if provided
    if (Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg: any) => {
        if (msg.speaker === 'user') {
          messages.push({ role: 'user', content: msg.text });
        } else if (msg.speaker === 'ai') {
          messages.push({ role: 'assistant', content: msg.text });
        }
      });
    }

    // Add the current message
    messages.push({ role: 'user', content: message });

    console.log('Generating chat response for message:', message);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500,
    });

    // Parse the response
    const response = completion.choices[0]?.message?.content;
    console.log('Generated response:', response);

    if (!response) {
      throw new Error('No response generated');
    }

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Error in chat generation:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 