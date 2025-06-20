
import React, { useState } from 'react';
import { X, CheckCircle, Circle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuizPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuizPanel: React.FC<QuizPanelProps> = ({ isOpen, onClose }) => {
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  const questions = [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What are the two main stages of photosynthesis?',
      options: [
        'Light reactions and Calvin cycle',
        'Glycolysis and Krebs cycle',
        'Transcription and translation',
        'Mitosis and meiosis'
      ]
    },
    {
      id: 'q2',
      type: 'short-answer',
      question: 'Explain the role of chlorophyll in photosynthesis.',
      placeholder: 'Type your answer here...'
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'Where do the light-independent reactions occur?',
      options: [
        'Thylakoid membrane',
        'Stroma',
        'Mitochondria',
        'Nucleus'
      ]
    },
    {
      id: 'q4',
      type: 'short-answer',
      question: 'What is the overall equation for photosynthesis?',
      placeholder: 'Write the chemical equation...'
    },
    {
      id: 'q5',
      type: 'multiple-choice',
      question: 'What is the main product of photosynthesis that plants use for energy?',
      options: [
        'Oxygen',
        'Carbon dioxide',
        'Glucose',
        'Water'
      ]
    }
  ];

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  return (
    <div className={`
      fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    `}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Knowledge Check</h2>
            <p className="text-sm text-gray-600">Test your understanding of photosynthesis</p>
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
            <Card key={question.id} className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-900 flex items-start">
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full mr-3 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span>{question.question}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {question.type === 'multiple-choice' ? (
                  <div className="space-y-3">
                    {question.options?.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="hidden"
                        />
                        <div className="flex-shrink-0">
                          {answers[question.id] === option ? (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div>
                    <textarea
                      placeholder={question.placeholder}
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              Progress: {Object.keys(answers).length} of {questions.length} answered
            </div>
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
              />
            </div>
          </div>
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            disabled={Object.keys(answers).length < questions.length}
          >
            <FileText className="w-4 h-4 mr-2" />
            Submit Quiz
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizPanel;
