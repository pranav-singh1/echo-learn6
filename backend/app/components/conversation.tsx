'use client';

import React, { useCallback, useState } from 'react';
import { useConversation } from '@elevenlabs/react';
import MathRenderer from './MathRenderer';

// Types for quiz data
interface QuizQuestion {
  question: string;
  type: 'multiple-choice' | 'short-answer';
  options?: string[];
  answer: string;
}

interface QuizAnswers {
  [key: number]: string;
}

interface AnswerEvaluation {
  isCorrect: boolean;
  score: number;
  feedback: string;
  explanation: string;
}

interface QuizEvaluations {
  [key: number]: AnswerEvaluation;
}

export function Conversation() {
  const [log, setLog] = useState<string[]>([]); // chat log
  const [summary, setSummary] = useState<string>('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [evaluations, setEvaluations] = useState<QuizEvaluations>({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      setLog((prev) => [...prev, '[Connected]']);
    },
    onDisconnect: () => {
      setLog((prev) => [...prev, '[Disconnected]']);
    },
    onMessage: (message) => {
      let speaker: string;
      let text: string;
    
      // message has shape: { message: string; source: 'user' | 'agent' | ... }
      if (typeof message === 'object' && 'message' in message) {
        text = message.message;
        speaker = message.source === 'user' ? 'You' : 'Echo Learn';
      } else if (typeof message === 'string') {
        // fallback case
        text = message;
        speaker = 'AI';
      } else {
        text = '[Unknown message format]';
        speaker = 'System';
      }
    
      setLog((prev) => [...prev, `${speaker}: ${text}`]);
      console.log(`[${speaker}]`, text);
    },
    onError: (error) => {
      setLog((prev) => [...prev, `[Error] ${error}`]);
      console.error('Error:', error);
    },
  });

  const startConversation = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: 'agent_01jw58pna0f8tv6khmvbtsxwm9', // Replace with real ID
      });
    } catch (error: any) {
      console.error('Failed to start conversation:', error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);


  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const evaluateShortAnswer = async (questionIndex: number, question: QuizQuestion) => {
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAnswer: answers[questionIndex],
          correctAnswer: question.answer,
          question: question.question
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate answer');
      }

      const evaluation = await response.json();
      setEvaluations(prev => ({
        ...prev,
        [questionIndex]: evaluation
      }));
    } catch (error) {
      console.error('Error evaluating answer:', error);
    }
  };

  const checkAnswers = async () => {
    setIsEvaluating(true);
    setShowAnswers(true);

    // Evaluate all short answer questions
    const shortAnswerPromises = questions
      .map((q, idx) => {
        if (q.type === 'short-answer' && answers[idx]) {
          return evaluateShortAnswer(idx, q);
        }
        return Promise.resolve();
      });

    await Promise.all(shortAnswerPromises);
    setIsEvaluating(false);
  };

  const resetQuiz = () => {
    setShowAnswers(false);
    setAnswers({});
    setEvaluations({});
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        <button
          onClick={startConversation}
          disabled={conversation.status === 'connected'}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Start Conversation
        </button>
        <button
          onClick={stopConversation}
          disabled={conversation.status !== 'connected'}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
        >
          Stop Conversation
        </button>
      </div>

      <div className="mt-4 text-sm w-full max-w-xl bg-white rounded shadow p-4">
        <p className="font-bold mb-2 text-gray-800">Transcript:</p>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {log.map((entry, index) => {
            const [speaker, ...rest] = entry.split(': ');
            const messageText = rest.join(': ');

            return (
              <p key={index}>
                <span
                  className={
                    speaker === 'You'
                      ? 'text-green-500 font-semibold'
                      : speaker === 'Echo Learn'
                      ? 'text-blue-500 font-semibold'
                      : 'text-gray-500 font-semibold'
                  }
                >
                  {speaker}:
                </span>{' '}
                <span className="text-gray-800">
                  <MathRenderer text={messageText} />
                </span>
              </p>
            );
          })}
        </div>

        <button
          onClick={async () => {
            if (log.length === 0) return;
            setIsGenerating(true);
            resetQuiz();
            try {
              const response = await fetch('/api/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ log }),
              });
              
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate quiz');
              }
              
              const data = await response.json();
              setSummary(data.summary);
              setQuestions(data.questions);
            } catch (error) {
              console.error('Error generating quiz:', error);
              alert('Failed to generate quiz. Please try again.');
            } finally {
              setIsGenerating(false);
            }
          }}
          disabled={isGenerating || log.length === 0}
          className="mt-4 w-full px-4 py-2 bg-purple-500 text-white rounded disabled:bg-gray-300 hover:bg-purple-600 transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Generate Summary & Quiz'}
        </button>

        {summary && (
          <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="font-bold text-purple-800 mb-2 text-lg">Summary</h3>
            <p className="text-gray-800">{summary}</p>
          </div>
        )}

        {questions.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold text-purple-800 mb-4 text-lg">Quiz Questions</h3>
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div key={idx} className="p-4 bg-white rounded-lg border border-purple-200">
                  <p className="font-semibold mb-3 text-gray-800">
                    {idx + 1}. {q.question}
                  </p>
                  {q.type === 'multiple-choice' && q.options && (
                    <div className="ml-4 space-y-2">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center">
                          <input
                            type="radio"
                            name={`question-${idx}`}
                            id={`q${idx}-opt${optIdx}`}
                            className="mr-2"
                            value={opt}
                            checked={answers[idx] === opt}
                            onChange={(e) => handleAnswerChange(idx, e.target.value)}
                            disabled={showAnswers}
                          />
                          <label 
                            htmlFor={`q${idx}-opt${optIdx}`}
                            className={`text-gray-800 ${
                              showAnswers && opt === q.answer ? 'text-green-600 font-semibold' : 
                              showAnswers && answers[idx] === opt ? 'text-red-500 line-through' : ''
                            }`}
                          >
                            {opt}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                  {q.type === 'short-answer' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Your answer..."
                        className="w-full p-2 border rounded text-gray-800"
                        value={answers[idx] || ''}
                        onChange={(e) => handleAnswerChange(idx, e.target.value)}
                        disabled={showAnswers}
                      />
                      {showAnswers && (
                        <div className="mt-3 space-y-2">
                          {evaluations[idx] ? (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600">Score:</span>
                                <span className={`font-semibold ${
                                  evaluations[idx].score >= 80 ? 'text-green-600' :
                                  evaluations[idx].score >= 60 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {evaluations[idx].score}%
                                </span>
                              </div>
                              <div className="text-sm">
                                <p className="font-medium text-gray-600">Feedback:</p>
                                <p className="text-gray-800 mt-1">{evaluations[idx].feedback}</p>
                              </div>
                              <div className="text-sm">
                                <p className="font-medium text-gray-600">Explanation:</p>
                                <p className="text-gray-800 mt-1">{evaluations[idx].explanation}</p>
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-gray-500">Evaluating answer...</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={checkAnswers}
                disabled={showAnswers || Object.keys(answers).length === 0 || isEvaluating}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
              >
                {isEvaluating ? 'Evaluating...' : 'Check Answers'}
              </button>
              <button
                onClick={resetQuiz}
                disabled={!showAnswers || isEvaluating}
                className="px-4 py-2 bg-gray-500 text-white rounded disabled:bg-gray-300 hover:bg-gray-600 transition-colors"
              >
                Reset Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
