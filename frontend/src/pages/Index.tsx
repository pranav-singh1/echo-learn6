import React, { useState, useEffect } from 'react';
import Logo from '../components/Logo';
import { LandingPage } from '../components/LandingPage';
import { ChatInterface } from '../components/ChatInterface';
import { QuizPanel } from '../components/QuizPanel';
import { SummaryPanel } from '../components/SummaryPanel';
import { ConversationHistory } from '../components/ConversationHistory';
import { useAppContext } from '../contexts/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Menu, X, Home, Moon, Sun, HelpCircle, User, Settings, LogOut, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { OnboardingTour } from '../components/OnboardingTour';
import { useAuth } from '../contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

export const Index: React.FC = () => {
  const { user } = useAuth();
  const { signOut, updateProfile } = useAuth();
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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [profileName, setProfileName] = useState(user?.user_metadata?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');

  // Update profile fields when user data changes
  useEffect(() => {
    if (user) {
      setProfileName(user.user_metadata?.name || '');
      setProfileEmail(user.email || '');
    }
  }, [user]);

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

  const handleSaveProfile = async () => {
    try {
      await updateProfile({ name: profileName });
      setShowProfileModal(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleDeleteAllConversations = async () => {
    const doubleConfirm = window.prompt(
      'This will permanently delete ALL your conversation data. This action cannot be undone.\n\nType "DELETE" to confirm:'
    );
    
    if (doubleConfirm !== 'DELETE') {
      alert('Data deletion cancelled.');
      return;
    }

    try {
      // Import the storage service
      const { supabaseConversationStorage } = await import('../lib/supabaseConversationStorage');
      
      // Clear all conversations
      await supabaseConversationStorage.clearAllConversations();
      
      // Reload the app state
      window.location.reload();
      
      alert('All conversation data has been permanently deleted.');
    } catch (error) {
      console.error('Failed to delete data:', error);
      alert('Failed to delete data. Please try again.');
    }
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
            <span className="h-full w-auto flex items-center text-black dark:text-white cursor-pointer hover:scale-105 transition-transform duration-200" onClick={handleGoHome}>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2" aria-label="User menu">
                  <User className="h-4 w-4" />
                  {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <User className="mr-2 h-4 w-4" />
                  <span>{user?.email}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowProfileModal(true)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowSettingsModal(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleGoHome}>
                  <Home className="mr-2 h-4 w-4" />
                  <span>Home</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
      
      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account information</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Display Name
                </label>
                <Input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Enter your display name"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <Input
                  value={profileEmail}
                  disabled
                  className="w-full bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Email cannot be changed
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowProfileModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configure your preferences</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Theme</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark mode</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheme}
                  className="flex items-center gap-2"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Delete All Conversations</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete all your conversation history.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteAllConversations}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete All
                </Button>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setShowSettingsModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
