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

    const prompt = `You are evaluating a student's answer to a quiz question. Focus ONLY on the core conceptual understanding and ignore minor issues like:
- Missing articles (a, an, the)
- Minor punctuation differences
- Slightly different word order
- Abbreviations vs full words
- Singular vs plural forms
- Minor grammar mistakes

Question: "${question}"
Correct answer: "${correctAnswer}"
Student's answer: "${userAnswer}"

IMPORTANT EVALUATION CRITERIA:
1. If the student demonstrates understanding of the core concept, even with minor wording differences, consider it correct
2. Be encouraging but HONEST - if something is incomplete or missing, point it out clearly
3. Focus feedback on what they got right AND what they could improve or add
4. If their answer is partial, acknowledge what's correct but specify what's missing
5. Provide constructive suggestions for improvement, not just praise

Evaluate the student's answer and respond in this JSON format:
{
  "isCorrect": boolean (true if they understand the core concept, even if incomplete),
  "score": number (0-100, based on completeness and accuracy of understanding),
  "feedback": "Balanced feedback: acknowledge what they got right, then clearly state what's missing or could be improved. Be specific about gaps.",
  "explanation": "Brief explanation of the complete concept, highlighting any parts the student missed"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an educational evaluator who provides balanced, constructive feedback. Be encouraging but honest about gaps in understanding.' },
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