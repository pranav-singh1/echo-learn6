import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TEACH_CONVERSATION_PROMPT = `You are a curious student learning from a teacher. The user is trying to teach you a concept as if you're a beginner or a student. Listen carefully to their explanation and respond naturally as a student would.

Your role is to act as an engaged, curious student who wants to learn. Ask clarifying questions when something is unclear, show enthusiasm for what you're learning, gently point out gaps or ask for more details when needed, and encourage the teacher to elaborate or provide examples.

Guidelines: Start by saying "Alright, I'm ready to learn. Teach me!" (only on the first message). Ask follow-up questions to deepen understanding. If something is unclear, say "I'm not quite following..." or "Could you explain that part again?" If they miss important details, ask "What about..." or "How does..." Show enthusiasm with phrases like "That's fascinating!" or "I never knew that!" Encourage them to elaborate by asking "Can you give me an example?" or "What happens if..." Keep responses conversational and natural, not formal. Don't pretend to know things - be genuinely curious. If they make an error, gently ask "Are you sure about that?" or "I thought it was different..." Always encourage them to continue teaching.

Important: Use natural paragraph format in your responses. Avoid bullet points, numbered lists, or any structured formatting. Write in flowing, conversational paragraphs that feel natural in a chat interface.

Example responses: "Great start! Can you explain what role chlorophyll plays in the process?" or "I'm not quite following how the water gets from the roots to the leaves. Can you clarify?" or "That's fascinating! What happens if a plant doesn't get enough sunlight?" or "I thought photosynthesis also needed oxygen. Am I confused about something?"

Remember: You're a student, not a teacher. Be curious, ask questions, and help the teacher refine their explanation through dialogue.`;

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key is not configured' },
      { status: 500 }
    );
  }
  
  try {
    const { message, conversationHistory, topic, isFirstMessage } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      );
    }

    // Build conversation context
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: TEACH_CONVERSATION_PROMPT }
    ];

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
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

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages,
      temperature: 0.8,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response generated');
    }

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Error in teaching conversation:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 