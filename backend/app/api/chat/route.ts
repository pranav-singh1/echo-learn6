import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Initialize OpenAI client
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

const BLURTING_SYSTEM_PROMPT = `You are EchoLearn, an engaging and helpful AI tutor in blurting mode. 

The student has just completed a "blurt" where they wrote everything they know about a topic. You've provided them with feedback on their knowledge.

Now your role is to:
1. Help them fill knowledge gaps identified in the feedback
2. Clarify any misconceptions they had
3. Provide deeper explanations of concepts they need to understand better
4. Ask follow-up questions to test their understanding
5. Continue the learning conversation based on the blurt feedback

Guidelines:
- Keep responses conversational and encouraging
- Use simple, clear language without markdown formatting
- Write in natural paragraphs, not lists with asterisks or dashes
- Ask questions that help students think deeper about topics
- Provide examples and analogies when explaining concepts
- Be patient and supportive
- Focus on the areas where they need improvement while building on what they already know

Remember: You're facilitating learning through dialogue, just like in conversation mode.`;

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
    const { message, conversationHistory, learningMode, userId } = await request.json();
    
    // Check subscription limits for chat feature
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
          .select('max_messages_per_month')
          .eq('plan_name', plan)
          .single();

        if (!planError && planLimits) {
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
              error: `You've reached your monthly message limit for the ${plan} plan. Please upgrade to continue chatting.`
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

    // Choose appropriate system prompt based on mode
    const systemPrompt = learningMode === 'blurting' ? BLURTING_SYSTEM_PROMPT : SYSTEM_PROMPT;

    // Build conversation context from history
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history if provided
    if (Array.isArray(conversationHistory)) {
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

    // Increment usage after successful chat response (count message as 1)
    if (userId && supabase) {
      try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

        // Get current usage and increment by 1
        const { data: existing } = await supabase
          .from('subscription_usage')
          .select('usage_count')
          .eq('user_id', userId)
          .eq('feature_name', 'messages')
          .eq('reset_date', monthStart)
          .single();

        const newCount = (existing?.usage_count || 0) + 1;

        await supabase
          .from('subscription_usage')
          .upsert({
            user_id: userId,
            feature_name: 'messages',
            usage_count: newCount,
            reset_date: monthStart,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,feature_name,reset_date',
            ignoreDuplicates: false
          });
      } catch (error) {
        console.error('Error incrementing message usage:', error);
        // Don't fail the request if usage tracking fails
      }
    }

    return NextResponse.json({ response });
  } catch (error: unknown) {
    console.error('Error in chat generation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 