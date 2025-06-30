import React, { useState } from 'react';
import { LandingPage } from '../components/LandingPage';
import { ChatInterface } from '../components/ChatInterface';
import { QuizPanel } from '../components/QuizPanel';
import { SummaryPanel } from '../components/SummaryPanel';
import { ConversationHistory } from '../components/ConversationHistory';
import { FloatingMic } from '../components/FloatingMic';
import { useAppContext } from '../contexts/AppContext';
import { Button } from '../components/ui/button';
import { Menu, X, Home } from 'lucide-react';

export const Index: React.FC = () => {
  const { activePanel, setActivePanel } = useAppContext();
  const [showConversation, setShowConversation] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  const handleStartConversation = () => {
    setShowConversation(true);
  };

  const handleGoHome = () => {
    setShowConversation(false);
    setActivePanel(null);
  };

  // Show landing page if conversation hasn't started
  if (!showConversation) {
    return <LandingPage onStartConversation={handleStartConversation} />;
  }

  // Show conversation interface
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Conversation History Sidebar - Controlled by showHistory state */}
      {showHistory && (
        <div className="block">
          <ConversationHistory />
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header with toggle */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="md:hidden"
            >
              {showHistory ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">EchoLearn</h1>
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="hidden md:flex"
            >
              {showHistory ? 'Hide History' : 'Show History'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoHome}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
          </div>
        </div>
        
        <div className="flex-1 flex min-w-0">
          {/* Chat Interface - Always visible */}
          <div className="flex-1 p-4 md:p-6 transition-all duration-300">
            <ChatInterface />
          </div>
          
          {/* Right Panel - Always rendered, only shows content if activePanel is set */}
          <div className="md:w-96 border-l border-gray-200 bg-white flex-shrink-0">
            {activePanel === 'quiz' && (
              <QuizPanel onClose={() => setActivePanel(null)} />
            )}
            {activePanel === 'summary' && (
              <SummaryPanel onClose={() => setActivePanel(null)} />
            )}
            {/* Leave blank or add a placeholder if desired */}
          </div>
        </div>
      </div>
      
      {/* Floating Mic */}
      <FloatingMic />
    </div>
  );
};
