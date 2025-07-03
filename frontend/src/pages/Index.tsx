import React, { useState, useEffect } from 'react';
import Logo from '../components/Logo';
import { LandingPage } from '../components/LandingPage';
import { ChatInterface } from '../components/ChatInterface';
import { QuizPanel } from '../components/QuizPanel';
import { SummaryPanel } from '../components/SummaryPanel';
import { ConversationHistory } from '../components/ConversationHistory';
import { FloatingMic } from '../components/FloatingMic';
import { useAppContext } from '../contexts/AppContext';
import { Button } from '../components/ui/button';
import { Menu, X, Home, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const Index: React.FC = () => {
  const { activePanel, setActivePanel, createFreshSession } = useAppContext();
  const [showConversation, setShowConversation] = useState(() => {
    // Try to load from localStorage, default to false
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('showConversation');
      return stored === 'true';
    }
    return false;
  });
  const [showHistory, setShowHistory] = useState(true);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showConversation', showConversation ? 'true' : 'false');
    }
  }, [showConversation]);

  const handleStartConversation = async () => {
    // Create a fresh session when transitioning from landing page
    await createFreshSession();
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
    <div className="h-screen bg-background text-foreground flex">
      {/* Conversation History Sidebar - Controlled by showHistory state */}
      {showHistory && (
        <div className="block">
          <ConversationHistory onHide={() => setShowHistory(false)} />
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-h-0 bg-background text-foreground">
        {/* Header with toggle */}
        <div className="bg-background border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3" style={{ height: '80px' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="md:hidden"
              aria-label={showHistory ? 'Hide history' : 'Show history'}
            >
              {showHistory ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <span className="h-full w-auto flex items-center text-black dark:text-white">
              <Logo className="h-full w-auto" />
            </span>
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
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="flex items-center gap-2"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? 'Light' : 'Dark'}
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
        
        <div className="flex-1 flex min-w-0 h-full min-h-0">
          {/* Chat Interface - Always visible */}
          <div className="flex-1 h-full min-h-0 flex flex-col p-2 md:p-4 transition-all duration-300">
            <ChatInterface />
          </div>
          
          {/* Right Panel - Conditional, only rendered when activePanel is set */}
          {activePanel && (
            <div className="md:w-96 border-l border-border bg-white dark:bg-background dark:text-foreground flex-shrink-0">
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
