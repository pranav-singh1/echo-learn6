import React from 'react';
import { X, FileText, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { useAppContext } from '../contexts/AppContext';

interface SummaryPanelProps {
  onClose: () => void;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({ onClose }) => {
  const { quizSummary: summary, setActivePanel } = useAppContext();

  if (!summary) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center">
            <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Conversation Summary</h2>
              <p className="text-sm text-gray-600">No summary available yet</p>
            </div>
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
            <h3 className="text-lg font-medium mb-2">No Summary Available</h3>
            <p className="text-sm mb-4">
              Generate a quiz to create a summary of your conversation.
            </p>
            <Button
              onClick={() => setActivePanel('chat')}
              variant="outline"
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
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
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center">
          <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Conversation Summary</h2>
            <p className="text-sm text-gray-600">AI-generated summary of your discussion</p>
          </div>
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

      {/* Summary Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-start mb-4">
            <FileText className="w-6 h-6 text-purple-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-purple-800 mb-2">Key Points</h3>
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {summary}
              </p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">💡 Study Tips</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Review this summary before taking the quiz</li>
            <li>• Try explaining these concepts to someone else</li>
            <li>• Connect these ideas to what you already know</li>
            <li>• Practice recalling the key points from memory</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <Button 
          onClick={() => setActivePanel('quiz')}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
        >
          Got it! Ready for the quiz
        </Button>
      </div>
    </div>
  );
}; 