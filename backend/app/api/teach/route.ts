import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase client
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null;

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
    const { message, conversationHistory, userId } = await request.json();
    
    // Check subscription limits for teaching feature
    if (userId && supabase) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('subscription_plan')
        .eq('id', userId)
        .single();

      if (!userError && user) {
        const plan = user.subscription_plan || 'free';
        const { data: planLimits, error: planError } = await supabase
          .from('plan_limits')
          .select('max_messages_per_month, can_use_teaching')
          .eq('plan_name', plan)
          .single();

        if (!planError && planLimits) {
          // Check if teaching feature is enabled
          if (!planLimits.can_use_teaching) {
            return NextResponse.json({
              error: `Teaching mode is not available in your ${plan} plan. Please upgrade to use this feature.`
            }, { status: 403 });
          }

          const maxMessages = planLimits.max_messages_per_month;
          
          // Get current month's usage (use month start for reset_date)
          const now = new Date();
          const currentDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          const { data: usage } = await supabase
            .from('subscription_usage')
            .select('usage_count')
            .eq('user_id', userId)
            .eq('feature_name', 'messages')
            .eq('reset_date', currentDate)
            .single();

          const currentUsage = usage?.usage_count || 0;
          
          if (maxMessages !== -1 && currentUsage >= maxMessages) {
            return NextResponse.json({
              error: `You've reached your monthly message limit for the ${plan} plan. Please upgrade to continue using teaching mode.`
            }, { status: 403 });
          }
        }
      }
    }
    
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
      conversationHistory.forEach((msg: { speaker: string; text: string }) => {
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

    // Increment message usage after successful response
    if (userId && supabase) {
      try {
        const now = new Date();
        const currentDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        
        await supabase.rpc('increment_usage', {
          p_user_id: userId,
          p_feature_name: 'messages',
          p_reset_date: currentDate,
          p_increment: 1
        });
      } catch (error) {
        console.error('Error incrementing teaching message usage:', error);
        // Don't fail the request if usage tracking fails
      }
    }

    return NextResponse.json({ response });
  } catch (error: unknown) {
    console.error('Error in teaching conversation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 