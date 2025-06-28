import React, { useState } from 'react';
import { LandingPage } from '../components/LandingPage';
import { ChatInterface } from '../components/ChatInterface';
import { QuizPanel } from '../components/QuizPanel';
import { SummaryPanel } from '../components/SummaryPanel';
import { Sidebar } from '../components/Sidebar';
import { FloatingMic } from '../components/FloatingMic';
import { useAppContext } from '../contexts/AppContext';

export const Index: React.FC = () => {
  const { activePanel, setActivePanel } = useAppContext();
  const [showConversation, setShowConversation] = useState(false);

  const handleStartConversation = () => {
    setShowConversation(true);
  };

  // Show landing page if conversation hasn't started
  if (!showConversation) {
    return <LandingPage onStartConversation={handleStartConversation} />;
  }

  // Show conversation interface
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex">
          {/* Chat Interface - Always visible */}
          <div className="flex-1 p-6">
            <ChatInterface />
          </div>
          
          {/* Right Panel - Conditional */}
          {activePanel && (
            <div className="w-96 border-l border-gray-200 bg-white">
              {activePanel === 'quiz' && (
                <QuizPanel onClose={() => setActivePanel(null)} />
              )}
              {activePanel === 'summary' && (
                <SummaryPanel onClose={() => setActivePanel(null)} />
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Floating Mic */}
      <FloatingMic />
    </div>
  );
};
