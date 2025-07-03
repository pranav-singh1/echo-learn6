import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an assistant that generates concise conversation titles based on the initial messages.
Create a short, descriptive title (2-5 words) that captures the main topic or question.
Examples:
- "Python Programming Basics"
- "Math Homework Help"
- "Biology Study Guide"
- "History Essay Tips"
- "Science Project Ideas"

Respond with ONLY the title text, no quotes or additional formatting.`;

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
    const { messages } = await request.json();
    
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or empty messages' },
        { status: 400 }
      );
    }

    // Take first few messages for context (limit to avoid token overflow)
    const contextMessages = messages.slice(0, 4).map(msg => 
      `${msg.speaker === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
    ).join('\n');

    console.log('Generating title for messages:', contextMessages.substring(0, 100) + '...');

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: contextMessages }
      ],
      temperature: 0.3,
      max_tokens: 50,
    });

    // Parse the response
    const title = completion.choices[0]?.message?.content?.trim();
    console.log('Generated title:', title);

    if (!title) {
      throw new Error('No title generated');
    }

    return NextResponse.json({ title });
  } catch (error: any) {
    console.error('Error in title generation:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 