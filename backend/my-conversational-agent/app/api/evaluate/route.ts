import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { userAnswer, correctAnswer, question } = await request.json();

    if (!userAnswer || !correctAnswer || !question) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const prompt = `You are evaluating a student's answer to a quiz question.

Question: "${question}"
Correct answer: "${correctAnswer}"
Student's answer: "${userAnswer}"

Evaluate the student's answer and respond in this JSON format:
{
  "isCorrect": boolean (true if the answer is essentially correct, even if not word-for-word),
  "score": number (0-100, indicating how close the answer is to being correct),
  "feedback": "Detailed feedback explaining what was good and what could be improved",
  "explanation": "Brief explanation of the correct answer"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful and encouraging educational assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3 // Lower temperature for more consistent evaluations
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const evaluation = JSON.parse(content);
    return NextResponse.json(evaluation);
  } catch (error: any) {
    console.error('Error in answer evaluation:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 