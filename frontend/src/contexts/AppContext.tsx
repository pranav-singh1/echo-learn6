import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { conversationService, ConversationState } from '../lib/conversation';
import { ElevenLabsConversation, ConversationMessage } from '../components/ElevenLabsConversation';

interface AppContextType {
  // Conversation state
  isConnected: boolean;
  isListening: boolean;
  conversationError: string | null;
  messages: ConversationMessage[];
  
  // Conversation actions
  startConversation: () => Promise<void>;
  stopConversation: () => Promise<void>;
  sendTextMessage: (text: string) => Promise<void>;
  
  // Quiz state
  quizQuestions: any[];
  quizSummary: string | null;
  isGeneratingQuiz: boolean;
  generateQuiz: () => Promise<void>;
  
  // UI state
  activePanel: 'chat' | 'quiz' | 'summary' | null;
  setActivePanel: (panel: 'chat' | 'quiz' | 'summary' | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Conversation state
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversationError, setConversationError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  
  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizSummary, setQuizSummary] = useState<string | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  
  // UI state
  const [activePanel, setActivePanel] = useState<'chat' | 'quiz' | 'summary' | null>('chat');

  // Subscribe to conversation service events
  useEffect(() => {
    const unsubscribeMessages = conversationService.onMessage((message) => {
      setMessages(prev => [...prev, message]);
    });

    const unsubscribeState = conversationService.onStateChange((state) => {
      if (state.isConnected !== undefined) setIsConnected(state.isConnected);
      if (state.isListening !== undefined) setIsListening(state.isListening);
      if (state.error !== undefined) setConversationError(state.error);
    });

    // Cleanup on unmount
    return () => {
      unsubscribeMessages();
      unsubscribeState();
      conversationService.destroy();
    };
  }, []);

  // Conversation actions
  const startConversation = async () => {
    try {
      setConversationError(null);
      await conversationService.startConversation();
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setConversationError(error instanceof Error ? error.message : 'Failed to start conversation');
    }
  };

  const stopConversation = async () => {
    try {
      await conversationService.stopConversation();
    } catch (error) {
      console.error('Failed to stop conversation:', error);
    }
  };

  const sendTextMessage = async (text: string) => {
    try {
      await conversationService.sendTextMessage(text);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Quiz actions
  const generateQuiz = async () => {
    if (messages.length === 0) return;
    
    setIsGeneratingQuiz(true);
    try {
      // Convert messages to the format expected by the backend
      const conversationLog = messages.map(msg => {
        const speaker = msg.speaker === 'user' ? 'You' : 'Echo Learn';
        return `${speaker}: ${msg.text}`;
      });

      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log: conversationLog }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate quiz');
      }

      const data = await response.json();
      setQuizSummary(data.summary);
      setQuizQuestions(data.questions);
      setActivePanel('quiz');
    } catch (error) {
      console.error('Error generating quiz:', error);
      setConversationError(error instanceof Error ? error.message : 'Failed to generate quiz');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const value: AppContextType = {
    // Conversation state
    isConnected,
    isListening,
    conversationError,
    messages,
    
    // Conversation actions
    startConversation,
    stopConversation,
    sendTextMessage,
    
    // Quiz state
    quizQuestions,
    quizSummary,
    isGeneratingQuiz,
    generateQuiz,
    
    // UI state
    activePanel,
    setActivePanel,
  };

  return (
    <AppContext.Provider value={value}>
      {/* Hidden ElevenLabs conversation component */}
      <ElevenLabsConversation
        onMessage={(message) => conversationService.addMessage(message)}
        onStateChange={(state) => conversationService.updateState(state)}
        onStart={() => console.log('Conversation started')}
        onStop={() => console.log('Conversation stopped')}
      />
      {children}
    </AppContext.Provider>
  );
}; 