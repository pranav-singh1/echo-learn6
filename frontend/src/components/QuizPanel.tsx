import React, { useState } from 'react';
import { X, CheckCircle, Circle, FileText, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useAppContext } from '../contexts/AppContext';
import { evaluateAnswer } from '../lib/api';
import { useToast } from '../hooks/use-toast';

interface QuizPanelProps {
  onClose: () => void;
}

export const QuizPanel: React.FC<QuizPanelProps> = ({ onClose }) => {
  const { toast } = useToast();
  const {
    quizQuestions: questions,
    setActivePanel
  } = useAppContext();

  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [evaluations, setEvaluations] = useState<{ [key: number]: any }>({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const evaluateShortAnswer = async (questionIndex: number) => {
    const question = questions[questionIndex];
    const userAnswer = answers[questionIndex];
    
    if (!userAnswer || question.type !== 'short-answer') return;

    try {
      const evaluation = await evaluateAnswer({
        userAnswer,
        correctAnswer: question.answer,
        question: question.question
      });

      setEvaluations(prev => ({
        ...prev,
        [questionIndex]: evaluation
      }));
    } catch (error) {
      console.error('Error evaluating answer:', error);
      toast({
        title: "Evaluation Failed",
        description: "Failed to evaluate your answer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const checkAnswers = async () => {
    if (questions.length === 0) {
      toast({
        title: "No Quiz Available",
        description: "Generate a quiz first by having a conversation.",
        variant: "destructive",
      });
      return;
    }

    setIsEvaluating(true);
    setShowAnswers(true);

    // Evaluate all short answer questions
    const shortAnswerPromises = questions
      .map((q, idx) => {
        if (q.type === 'short-answer' && answers[idx]) {
          return evaluateShortAnswer(idx);
        }
        return Promise.resolve();
      });

    await Promise.all(shortAnswerPromises);
    setIsEvaluating(false);

    toast({
      title: "Quiz Completed!",
      description: "Your answers have been evaluated. Check the feedback below.",
    });
  };

  const handleReset = () => {
    setShowAnswers(false);
    setAnswers({});
    setEvaluations({});
    toast({
      title: "Quiz Reset",
      description: "Quiz has been reset. You can start over.",
    });
  };

  if (questions.length === 0) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Knowledge Check</h2>
            <p className="text-sm text-gray-600">No quiz available yet</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No Quiz Available</h3>
            <p className="text-sm mb-4">
              Start a conversation and generate a quiz to test your knowledge.
            </p>
            <Button
              onClick={() => setActivePanel('chat')}
              variant="outline"
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              Start Conversation
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Knowledge Check</h2>
          <p className="text-sm text-gray-600">
            {questions.length} questions • {Object.keys(answers).length} answered
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Quiz Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {questions.map((question, index) => (
          <Card key={index} className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-900 flex items-start">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full mr-3 flex-shrink-0">
                  {index + 1}
                </span>
                <span>{question.question}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {question.type === 'multiple-choice' && question.options ? (
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        checked={answers[index] === option}
                        disabled={showAnswers}
                        className="hidden"
                      />
                      <div className="flex-shrink-0">
                        {showAnswers && option === question.answer ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : showAnswers && answers[index] === option && option !== question.answer ? (
                          <Circle className="w-5 h-5 text-red-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      <span className={`text-sm ${
                        showAnswers && option === question.answer 
                          ? 'text-green-700 font-medium' 
                          : showAnswers && answers[index] === option && option !== question.answer
                          ? 'text-red-700 font-medium'
                          : 'text-gray-700'
                      }`}>
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={answers[index] || ''}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    placeholder="Type your answer here..."
                    disabled={showAnswers}
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  {showAnswers && evaluations[index] && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm font-medium ${
                          evaluations[index].isCorrect ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {evaluations[index].isCorrect ? 'Correct!' : 'Incorrect'}
                        </span>
                        <span className="text-sm text-gray-600">
                          Score: {evaluations[index].score}/10
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{evaluations[index].feedback}</p>
                      <p className="text-xs text-gray-600">{evaluations[index].explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-3">
          {!showAnswers ? (
            <Button
              onClick={checkAnswers}
              disabled={isEvaluating || Object.keys(answers).length === 0}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Evaluating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Check Answers
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Quiz
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
