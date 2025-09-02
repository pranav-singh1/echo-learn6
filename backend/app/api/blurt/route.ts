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

const BLURT_FEEDBACK_PROMPT = `You are an encouraging and supportive AI tutor analyzing a student's "blurt" - where they write everything they know about a topic.

Your role is to provide natural, conversational feedback that sounds like a caring tutor who genuinely wants to help the student learn. Write as if you're sitting next to the student, reviewing their work together.

Respond in this JSON format, but write each section in a warm, human, conversational tone - like a real tutor would speak:

{
  "knowledgeStrengths": ["Write like: 'I love how you explained...' or 'You really get the concept of...'"],
  "knowledgeGaps": ["Write like: 'Let's work together on...' or 'I think you'd benefit from exploring...'"], 
  "misconceptions": ["Write like: 'Actually, let me help clarify this...' or 'Here's a different way to think about...'"],
  "suggestions": ["Write like: 'Why don't we try...' or 'I'd recommend starting with...'"],
  "encouragement": "Write a warm, personal message like you're genuinely proud of their effort and excited to help them learn more"
}

Guidelines:
- Write each JSON field as if you're speaking directly to the student
- Use "I", "you", "we", "let's" - make it personal and conversational  
- Be encouraging but honest - frame gaps as opportunities to learn together
- Sound like a caring human tutor, not a robot giving analysis
- Be specific about what they understand and what needs work
- Keep it warm, supportive, and motivational
- Write in natural, flowing language within each JSON field`;

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key is not configured' },
      { status: 500 }
    );
  }
  
  try {
    const { blurtContent, topic, userId } = await request.json();
    
    // Check subscription limits for blurting feature
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
          .select('max_messages_per_month, can_use_blurting')
          .eq('plan_name', plan)
          .single();

        if (!planError && planLimits) {
          // Check if blurting feature is enabled
          if (!planLimits.can_use_blurting) {
            return NextResponse.json({
              error: `Blurting mode is not available in your ${plan} plan. Please upgrade to use this feature.`
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
              error: `You've reached your monthly message limit for the ${plan} plan. Please upgrade to continue using blurting mode.`
            }, { status: 403 });
          }
        }
      }
    }
    
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
        console.error('Error incrementing blurt message usage:', error);
        // Don't fail the request if usage tracking fails
      }
    }

    return NextResponse.json({ feedback });
  } catch (error: any) {
    console.error('Error in blurt analysis:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 