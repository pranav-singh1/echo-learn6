// API service functions for communicating with the backend

export interface QuizQuestion {
  question: string;
  type: 'multiple-choice' | 'short-answer';
  options?: string[];
  answer: string;
}

export interface QuizResponse {
  summary: string;
  questions: QuizQuestion[];
}

export interface AnswerEvaluation {
  isCorrect: boolean;
  score: number;
  feedback: string;
  explanation: string;
}

export interface EvaluateRequest {
  userAnswer: string;
  correctAnswer: string;
  question: string;
}

// Generate quiz from conversation log
export async function generateQuiz(log: string[], userId?: string): Promise<QuizResponse> {
  try {
    const response = await fetch('/api/quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ log, userId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle specific error cases
      if (response.status === 500) {
        if (errorData.error?.includes('OPENAI_API_KEY')) {
          throw new Error('OpenAI API key is missing. Please add it to your backend .env.local file.');
        }
        throw new Error(errorData.error || 'Backend server error. Please check if the backend is running.');
      }
      
      if (response.status === 404) {
        throw new Error('Backend API not found. Please make sure the backend server is running on localhost:3000.');
      }
      
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to generate quiz`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Cannot connect to backend server. Please make sure the backend is running on localhost:3000.');
    }
    throw error;
  }
}

// Evaluate a short answer
export async function evaluateAnswer(request: EvaluateRequest): Promise<AnswerEvaluation> {
  try {
    const response = await fetch('/api/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle specific error cases
      if (response.status === 500) {
        if (errorData.error?.includes('OPENAI_API_KEY')) {
          throw new Error('OpenAI API key is missing. Please add it to your backend .env.local file.');
        }
        throw new Error(errorData.error || 'Backend server error. Please check if the backend is running.');
      }
      
      if (response.status === 404) {
        throw new Error('Backend API not found. Please make sure the backend server is running on localhost:3000.');
      }
      
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to evaluate answer`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Cannot connect to backend server. Please make sure the backend is running on localhost:3000.');
    }
    throw error;
  }
} 