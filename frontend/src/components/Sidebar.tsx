import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  MessageCircle, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  FileText,
  X
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    messages, 
    isConnected, 
    activePanel, 
    setActivePanel,
    quizSummary,
    quizQuestions 
  } = useAppContext();

  // Calculate conversation stats
  const userMessages = messages.filter(m => m.speaker === 'user').length;
  const aiMessages = messages.filter(m => m.speaker === 'ai').length;
  const totalMessages = messages.length;
  const conversationDuration = messages.length > 0 
    ? Math.round((new Date().getTime() - new Date(messages[0].timestamp).getTime()) / 60000)
    : 0;

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Study Session</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActivePanel(null)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Connection Status */}
        <div className="mt-3 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Active Session' : 'Not Connected'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Session Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">{totalMessages}</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">Total Messages</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">{conversationDuration}</span>
            </div>
            <p className="text-xs text-green-700 mt-1">Minutes</p>
          </div>
        </div>
        
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Your Messages:</span>
            <span className="font-medium">{userMessages}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">AI Responses:</span>
            <span className="font-medium">{aiMessages}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          {quizSummary && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActivePanel('summary')}
              className="w-full justify-start"
              disabled={activePanel === 'summary'}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              View Summary
            </Button>
          )}
          {quizQuestions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActivePanel('quiz')}
              className="w-full justify-start"
              disabled={activePanel === 'quiz'}
            >
              <FileText className="h-4 w-4 mr-2" />
              Take Quiz ({quizQuestions.length} questions)
            </Button>
          )}
        </div>
      </div>

      {/* Recent Messages */}
      <div className="flex-1 p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Messages</h3>
        <ScrollArea className="h-full">
          <div className="space-y-3">
            {messages.slice(-5).reverse().map((message, index) => (
              <Card key={index} className="text-sm">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        message.speaker === 'user' 
                          ? 'text-green-600 bg-green-50 border-green-200' 
                          : 'text-blue-600 bg-blue-50 border-blue-200'
                      }`}
                    >
                      {message.speaker === 'user' ? 'You' : 'EchoLearn'}
                    </Badge>
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                  </div>
                  <p className="text-gray-700 line-clamp-2">{message.text}</p>
                </CardContent>
              </Card>
            ))}
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs">Start a conversation to see messages here</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

