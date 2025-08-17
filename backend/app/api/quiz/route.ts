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

const EDUCATIONAL_CONTENT_CHECK_PROMPT = `You are analyzing a conversation transcript to determine if it contains educational content suitable for quiz generation.

Analyze the conversation and determine if it contains:
- Learning concepts, facts, or information that can be tested
- Educational discussions about topics like science, history, literature, math, etc.
- Explanations of processes, theories, or ideas
- Any content that would be appropriate for creating quiz questions

Respond with ONLY a JSON object in this format:
{
  "hasEducationalContent": boolean,
  "reason": "Brief explanation of why this does or doesn't contain educational content"
}

Examples of educational content:
- Discussions about historical events, scientific concepts, literary analysis
- Explanations of how things work, mathematical concepts, academic topics
- Learning about skills, processes, or factual information

Examples of non-educational content:
- Casual conversation, greetings, small talk
- Personal conversations about daily life
- Technical support or troubleshooting
- General chat without learning objectives`;

const SYSTEM_PROMPT = `You are an educational assistant that extracts key learning concepts from educational discussions.

IMPORTANT: Focus ONLY on the educational content discussed. Do NOT mention:
- EchoLearn, AI assistants, or chatbots
- The conversation format or that this was a discussion
- Meta-commentary about the learning process

Extract the core educational concepts, facts, and information that were covered. Summarize the actual subject matter that was learned.

Generate a concise summary of the educational content and 3-5 quiz questions (mix of multiple choice and short answer).

You MUST respond in this exact JSON format:
{
  "summary": "Concise summary of the key educational concepts and information covered (focus on the subject matter, not the conversation)",
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
}
You must only output the JSON, with no other text before or after.`;

export async function GET() {
  // Test endpoint to debug response format
  const testResponse = {
    summary: "This is a test summary to verify the response format is working correctly.",
    questions: [
      {
        question: "What is this a test of?",
        type: "multiple-choice",
        options: ["Response format", "Database", "Authentication", "UI"],
        answer: "Response format"
      },
      {
        question: "Is this test working?",
        type: "short-answer", 
        answer: "Yes, if you can see this response"
      }
    ]
  };
  
  console.log('Test endpoint called - returning:', testResponse);
  return NextResponse.json(testResponse);
}

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
    const { log, userId } = await request.json();
    
    // Debug logging
    console.log('Quiz API called with userId:', userId);
    console.log('Supabase configured:', !!supabase);
    
    // Check subscription limits for quiz generation
    if (userId && supabase) {
      console.log('Checking subscription limits for userId:', userId);
      
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('subscription_plan')
        .eq('id', userId)
        .single();

      console.log('User lookup result:', { user, userError });

      if (!userError && user) {
        const plan = user.subscription_plan || 'free';
        console.log('User plan found:', plan);
        
        const { data: planLimits, error: planError } = await supabase
          .from('plan_limits')
          .select('can_use_quiz, max_quiz_generations_per_day')
          .eq('plan_name', plan)
          .single();

        console.log('Plan limits lookup result:', { planLimits, planError });

        if (!planError && planLimits) {
          console.log('Plan limits found:', planLimits);
          
          // Check if quiz feature is enabled
          if (!planLimits.can_use_quiz) {
            console.log('Quiz feature disabled for plan:', plan);
            return NextResponse.json({
              error: `Quiz generation is not available in your ${plan} plan. Please upgrade to use this feature.`
            }, { status: 403 });
          }

          // Check usage limits (daily)
          const currentDate = new Date().toISOString().split('T')[0];
          console.log('Checking usage for date:', currentDate);
          
          const { data: usage } = await supabase
            .from('subscription_usage')
            .select('usage_count')
            .eq('user_id', userId)
            .eq('feature_name', 'quiz_generations')
            .eq('reset_date', currentDate)
            .single();

          const currentUsage = usage?.usage_count || 0;
          // Use daily limit from DB (e.g., 10/day)
          const maxUsage = planLimits.max_quiz_generations_per_day;
          
          console.log('Usage check result:', { currentUsage, maxUsage, usage });
          
          if (maxUsage !== -1 && currentUsage >= maxUsage) {
            console.log('Usage limit exceeded:', { currentUsage, maxUsage });
            return NextResponse.json({
              error: `You've reached your daily quiz generation limit for the ${plan} plan. Please try again tomorrow or upgrade to generate more quizzes.`
            }, { status: 403 });
          }
          
          console.log('Usage check passed - proceeding with quiz generation');
          
          // Store current usage for later increment
          const usageToIncrement = currentUsage;
        } else {
          console.log('Plan limits not found or error:', planError);
        }
      } else {
        console.log('User not found or error:', userError);
      }
    }
    
    if (!Array.isArray(log) || log.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or empty transcript' },
        { status: 400 }
      );
    }

    // Join the log entries into a single transcript
    const transcript = log.join('\n');
    console.log('Analyzing transcript for educational content:', transcript.substring(0, 100) + '...');

    // First, check if the conversation contains educational content
    const contentCheck = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: EDUCATIONAL_CONTENT_CHECK_PROMPT },
        { role: 'user', content: transcript }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const contentCheckResult = contentCheck.choices[0]?.message?.content;
    console.log('Educational content check result:', contentCheckResult);

    if (!contentCheckResult) {
      throw new Error('No response from educational content check');
    }

    let educationalAnalysis;
    try {
      educationalAnalysis = JSON.parse(contentCheckResult);
    } catch {
      console.error('Failed to parse educational content check:', contentCheckResult);
      throw new Error('Invalid response format from educational content analysis');
    }

    // If no educational content is found, return an error
    if (!educationalAnalysis.hasEducationalContent) {
      console.log('No educational content found:', educationalAnalysis.reason);
      return NextResponse.json(
        { 
          error: 'No educational content found',
          reason: educationalAnalysis.reason || 'The conversation does not contain sufficient educational content for quiz generation.'
        },
        { status: 400 }
      );
    }

    console.log('Educational content found, proceeding with quiz generation');

    // If educational content is found, proceed with quiz generation
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: transcript }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    // Parse the response
    const content = completion.choices[0]?.message?.content;
    console.log('OpenAI response content:', content);

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    // The `json_object` response format should guarantee valid JSON,
    // but we'll include a failsafe just in case.
    try {
      const result = JSON.parse(content);

      // Basic validation
      if (!result.summary || !Array.isArray(result.questions)) {
        console.error('Invalid JSON structure from OpenAI:', result);
        throw new Error('Invalid response format from OpenAI');
      }

      console.log('Successfully generated quiz with summary and', result.questions.length, 'questions');
      console.log('Final response being sent:', result);
      
      // Increment usage after successful quiz generation
      if (userId && supabase) {
        try {
          const currentDate = new Date().toISOString().split('T')[0];
          // Get current usage again for accurate increment
          const { data: currentUsageData } = await supabase
            .from('subscription_usage')
            .select('usage_count')
            .eq('user_id', userId)
            .eq('feature_name', 'quiz_generations')
            .eq('reset_date', currentDate)
            .single();
          
          const currentUsageCount = currentUsageData?.usage_count || 0;
          const newUsageCount = currentUsageCount + 1;
          console.log('Incrementing usage from', currentUsageCount, 'to', newUsageCount);
          
          await supabase
            .from('subscription_usage')
            .upsert({
              user_id: userId,
              feature_name: 'quiz_generations',
              usage_count: newUsageCount,
              reset_date: currentDate,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,feature_name,reset_date',
              ignoreDuplicates: false
            });
          
          console.log('Usage successfully incremented to:', newUsageCount);
        } catch (error) {
          console.error('Error incrementing quiz usage:', error);
          // Don't fail the request if usage tracking fails
        }
      }
      
      return NextResponse.json(result);
    } catch {
      console.error('Failed to parse JSON from OpenAI:', content);
      // Attempt to extract JSON from a string that might have ```json ... ``` markers
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          const extractedJson = JSON.parse(jsonMatch[1]);
          // Basic validation
          if (!extractedJson.summary || !Array.isArray(extractedJson.questions)) {
            console.error('Invalid JSON structure from extracted OpenAI response:', extractedJson);
            throw new Error('Invalid response format from OpenAI');
          }
          return NextResponse.json(extractedJson);
        } catch (e) {
          console.error('Failed to parse extracted JSON:', e);
          throw new Error('Could not extract valid JSON from OpenAI response.');
        }
      }
      throw new Error('Response from OpenAI was not valid JSON.');
    }
  } catch (error: unknown) {
    console.error('Error in quiz generation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 