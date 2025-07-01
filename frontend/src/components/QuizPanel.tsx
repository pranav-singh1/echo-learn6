import React, { useState } from 'react';
import { X, CheckCircle, Circle, FileText, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useAppContext } from '../contexts/AppContext';
import { evaluateAnswer } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { Textarea } from './ui/textarea';

interface QuizPanelProps {
  onClose: () => void;
}

export const QuizPanel: React.FC<QuizPanelProps> = ({ onClose }) => {
  const { toast } = useToast();
  const {
    quizQuestions: questions,
    quizAnswers: answers,
    quizEvaluations: evaluations,
    quizShowAnswers: showAnswers,
    updateQuizAnswer,
    updateQuizEvaluation,
    saveQuizShowAnswers,
    resetQuiz,
    setActivePanel
  } = useAppContext();

  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    updateQuizAnswer(questionIndex, answer);
  };

  const evaluateShortAnswer = async (questionIndex: number) => {
    const question = questions[questionIndex];
    const userAnswer = answers[questionIndex];

    if (!userAnswer || userAnswer.trim() === "") {
      // Auto feedback for empty answer
      updateQuizEvaluation(questionIndex, {
        score: 0,
        isCorrect: false,
        feedback: "No answer provided.",
        explanation: "You did not provide an answer for this question."
      });
      return;
    }

    try {
      const evaluation = await evaluateAnswer({
        userAnswer,
        correctAnswer: question.answer,
        question: question.question
      });

      updateQuizEvaluation(questionIndex, evaluation);
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
    saveQuizShowAnswers(true);

    // Evaluate all short answer questions
    const shortAnswerPromises = questions
      .map((q, idx) => {
        if (q.type === 'short-answer') {
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
    saveQuizShowAnswers(false);
    resetQuiz();
    toast({
      title: "Quiz Reset",
      description: "Quiz has been reset. You can start over.",
    });
  };

  if (questions.length === 0) {
    return (
      <div className="h-full flex flex-col bg-background text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">Knowledge Check</h2>
            <p className="text-sm text-muted-foreground">No quiz available yet</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center px-6 bg-background text-foreground">
          <div className="text-center text-muted-foreground">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Quiz Available</h3>
            <p className="text-sm mb-4">
              Start a conversation and generate a quiz to test your knowledge.
            </p>
            <Button
              onClick={() => setActivePanel('chat')}
              variant="outline"
              className="text-primary border-border hover:bg-muted"
            >
              Start Conversation
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">Knowledge Check</h2>
          <p className="text-sm text-muted-foreground">
            {questions.length} questions • {Object.keys(answers).length} answered
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Quiz Summary/Score */}
      {showAnswers && (
        <div className="px-6 py-4 border-b border-border bg-background flex items-center gap-4">
          {(() => {
            let sum = 0;
            let count = 0;
            questions.forEach((q, idx) => {
              if (q.type === 'multiple-choice') {
                // Check if user's answer matches the correct answer
                const userAnswer = answers[idx];
                if (userAnswer && userAnswer === q.answer) {
                  sum += 1;
                }
                count++;
              } else if (q.type === 'short-answer') {
                const evalObj = evaluations[idx];
                if (evalObj && typeof evalObj.score === 'number') {
                  sum += evalObj.score / 100;
                }
                count++;
              }
            });
            const percent = count > 0 ? Math.round((sum / count) * 100) : 0;
            return (
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-blue-700 dark:text-blue-300">Quiz Score:</span>
                <span className="text-lg font-bold text-green-700 dark:text-green-300">{percent}%</span>
                <span className="text-md font-medium text-gray-500 dark:text-gray-400">({sum.toFixed(2)} / {count})</span>
              </div>
            );
          })()}
        </div>
      )}

      {/* Quiz Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-background text-foreground">
        {questions.map((question, index) => (
          <Card key={index} className="border border-border shadow-sm bg-card text-card-foreground">
            <CardHeader className="pb-3 bg-card text-card-foreground">
              <CardTitle className="text-sm font-medium flex items-start text-card-foreground">
                <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full mr-3 flex-shrink-0">
                  {index + 1}
                </span>
                <span>{question.question}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 bg-card text-card-foreground">
              {question.type === 'multiple-choice' && question.options ? (
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border transition-all duration-200 ${
                        answers[index] === option
                          ? 'bg-blue-50 border-blue-300 shadow-sm text-blue-700 dark:bg-primary/20 dark:border-primary dark:text-white'
                          : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 dark:bg-muted dark:border-border dark:text-white'
                      }`}
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
                        ) : answers[index] === option ? (
                          <div className="w-5 h-5 rounded-full border-2 border-blue-500 bg-blue-500 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          </div>
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-white font-medium">
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
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400 dark:bg-card dark:text-white dark:placeholder:text-muted-foreground dark:border-border"
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
                          Score: {evaluations[index].score}/100
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
      <div className="px-6 py-4 border-t border-border bg-background">
        <div className="flex gap-3">
          {!showAnswers ? (
            <Button
              onClick={checkAnswers}
              disabled={isEvaluating || Object.keys(answers).length === 0}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:bg-background dark:text-foreground"
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
