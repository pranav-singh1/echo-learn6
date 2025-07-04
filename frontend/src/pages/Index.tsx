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
import { OnboardingTour } from '../components/OnboardingTour';
import { useAuth } from '../contexts/AuthContext';

export const Index: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // Only use app context when user is authenticated
  const appContext = user ? useAppContext() : null;
  const { activePanel, setActivePanel, startFreshConversation } = appContext || {
    activePanel: null,
    setActivePanel: () => {},
    startFreshConversation: () => {}
  };
  
  const [showConversation, setShowConversation] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [showTour, setShowTour] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('onboardingTourDismissed');
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showConversation', showConversation ? 'true' : 'false');
    }
  }, [showConversation]);

  const handleStartConversation = () => {
    // Start fresh conversation view (no session created until user sends message)
    startFreshConversation();
    setShowConversation(true);
    setActivePanel(null); // Ensure right panel is closed for new chat
  };

  const handleGoHome = () => {
    setShowConversation(false);
    setActivePanel(null);
  };

  const handleCloseTour = () => {
    setShowTour(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboardingTourDismissed', 'true');
    }
  };

  // Show landing page for unauthenticated users OR when showConversation is false
  if (!user || !showConversation) {
    return <LandingPage onStartConversation={handleStartConversation} />;
  }

  // Show conversation interface
  return (
    <div className="h-screen bg-background text-foreground flex relative">
      {showTour && <div className="fixed inset-0 z-[20000]"><OnboardingTour onClose={handleCloseTour} /></div>}
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
              data-tour="history"
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
              data-tour="theme-toggle"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoHome}
              className="flex items-center gap-2"
              data-tour="home"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
          </div>
        </div>
        
        <div className="flex-1 flex min-w-0 h-full min-h-0">
          {/* Chat Interface - Main content */}
          <div className="flex-1 h-full min-h-0 flex flex-col p-2 md:p-4 transition-all duration-300">
            <ChatInterface />
          </div>
          
          {/* Right Side: Quiz Panel */}
          {activePanel === 'quiz' && (
            <div className="w-80 h-full border-l border-border">
              <QuizPanel onClose={() => setActivePanel(null)} />
            </div>
          )}
          
          {/* Right Side: Summary Panel */}
          {activePanel === 'summary' && (
            <div className="w-80 h-full border-l border-border">
              <SummaryPanel onClose={() => setActivePanel(null)} />
            </div>
          )}
        </div>
      </div>
      
      {/* Floating Mic */}
      <FloatingMic />
    </div>
  );
};
