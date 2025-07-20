import { NextResponse } from 'next/server';
import OpenAI from 'openai';


// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export async function GET(request: Request) {
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
    const { log } = await request.json();
    
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
    } catch (parseError) {
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
      return NextResponse.json(result);
    } catch (parseError) {
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
  } catch (error: any) {
    console.error('Error in quiz generation:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 