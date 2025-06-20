import { NextResponse } from 'next/server';
import OpenAI from 'openai';


// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an educational assistant that creates summaries and quiz questions from conversation transcripts.
Generate a concise summary and 3-5 quiz questions (mix of multiple choice and short answer).
You MUST respond in this exact JSON format:
{
  "summary": "Brief summary of the key points...",
  "questions": [
    {
      "question": "Question text...",
      "type": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Correct option text"
    },
    {
      "question": "Short answer question text...",
      "type": "short-answer",
      "answer": "Expected answer text"
    }
  ]
}`;

export async function POST(request: Request) {
  try {
    // Parse request body
    const { log } = await request.json();
    
    if (!Array.isArray(log) || log.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or empty transcript' },
        { status: 400 }
      );
    }

    // Join the log entries into a single transcript
    const transcript = log.join('\n');

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: transcript }
      ],
      temperature: 0.7
    });

    // Parse the response
    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const result = JSON.parse(content);

    // Validate the response format
    if (!result.summary || !Array.isArray(result.questions)) {
      throw new Error('Invalid response format from OpenAI');
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in quiz generation:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 