import React, { useState, useEffect } from 'react';
import Logo from '../components/Logo';
import { LandingPage } from '../components/LandingPage';
import { ChatInterface } from '../components/ChatInterface';
import { QuizPanel } from '../components/QuizPanel';
import { SummaryPanel } from '../components/SummaryPanel';
import { ConversationHistory } from '../components/ConversationHistory';
import { useAppContext } from '../contexts/AppContext';
import { Button } from '../components/ui/button';
import { Menu, X, Home, Moon, Sun, HelpCircle } from 'lucide-react';
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
    // Only show tour if user hasn't seen it before
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('onboardingTourCompleted');
    }
    return false;
  });
  const [showHelp, setShowHelp] = useState(false);

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
    // Mark tour as completed so it doesn't show again
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboardingTourCompleted', 'true');
    }
  };

  const handleShowHelp = () => {
    setShowHelp(true);
  };

  const handleCloseHelp = () => {
    setShowHelp(false);
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
      
      {/* Help Button - Bottom Left */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleShowHelp}
        className="fixed bottom-4 left-4 z-50 rounded-full w-10 h-10 p-0 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-200"
        aria-label="Help"
      >
        <HelpCircle className="w-5 h-5" />
      </Button>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={handleCloseHelp}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl font-bold"
            >
              ×
            </button>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Help</h2>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div>
                <strong>Start Conversation:</strong> Click the microphone button or type in the chat to begin talking with EchoLearn.
              </div>
              <div>
                <strong>New Chat:</strong> Use the "New Chat" button in the sidebar to start fresh.
              </div>
              <div>
                <strong>Generate Quiz:</strong> After having a conversation, click "Generate Quiz" to test your knowledge.
              </div>
              <div>
                <strong>History:</strong> View and search your past conversations in the sidebar.
              </div>
              <div>
                <strong>Theme:</strong> Toggle between light and dark mode using the theme button.
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleCloseHelp} className="bg-blue-600 hover:bg-blue-700 text-white">
                Got it!
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
