import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BLURT_FEEDBACK_PROMPT = `You are an educational AI tutor analyzing a student's "blurt" - where they write everything they know about a topic.

Your role is to provide constructive, encouraging feedback that helps the student understand their current knowledge level and what to focus on next.

Analyze their blurt and provide:

1. **Knowledge Assessment**: What they understand well - be specific about concepts, processes, or facts they've grasped correctly
2. **Knowledge Gaps**: What they need to learn better - identify specific areas where their understanding is incomplete or missing
3. **Misconceptions**: Any incorrect information - gently point out any misunderstandings or factual errors
4. **Suggestions**: What to focus on next - provide specific, actionable next steps for their learning
5. **Encouragement**: Positive reinforcement for their effort - acknowledge their work and build confidence

Respond in this JSON format:
{
  "knowledgeStrengths": ["Specific concepts they understand well", "Another strength"],
  "knowledgeGaps": ["Specific areas they need to improve", "Another gap"],
  "misconceptions": ["Any incorrect information found", "Another misconception if any"],
  "suggestions": ["Specific next steps for learning", "Another suggestion"],
  "encouragement": "A warm, encouraging message that acknowledges their effort and builds confidence for continued learning",
  "overallScore": "Good/Fair/Needs Improvement"
}

Guidelines:
- Be encouraging but honest - don't sugarcoat gaps, but frame them as opportunities
- Be specific about what they know well and what they need to work on
- Provide actionable suggestions, not vague advice
- Acknowledge their effort and build confidence
- Focus on helping them learn, not just pointing out mistakes
- Keep the tone warm and supportive
- Write in natural paragraph format - avoid bullet points, numbered lists, or markdown formatting
- Use flowing, conversational paragraphs that read naturally`;

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key is not configured' },
      { status: 500 }
    );
  }
  
  try {
    const { blurtContent, topic } = await request.json();
    
    if (!blurtContent || typeof blurtContent !== 'string') {
      return NextResponse.json(
        { error: 'Invalid blurt content' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: BLURT_FEEDBACK_PROMPT },
        { role: 'user', content: `Topic: ${topic || 'General Knowledge'}\n\nStudent's Blurt:\n${blurtContent}` }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response generated');
    }

    const feedback = JSON.parse(response);
    return NextResponse.json({ feedback });
  } catch (error: any) {
    console.error('Error in blurt analysis:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 