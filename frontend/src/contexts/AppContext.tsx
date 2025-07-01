import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { conversationService, ConversationState } from '../lib/conversation';
import { supabaseConversationStorage, ConversationSession } from '../lib/supabaseConversationStorage';
import { ElevenLabsConversation, ConversationMessage } from '../components/ElevenLabsConversation';
import { useAuth } from './AuthContext';

interface AppContextType {
  // Conversation state
  isConnected: boolean;
  isListening: boolean;
  conversationError: string | null;
  messages: ConversationMessage[];
  
  // Session management
  activeSession: ConversationSession | null;
  allSessions: ConversationSession[];
  createNewSession: () => Promise<void>;
  switchToSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  updateSessionTitle: (sessionId: string, newTitle: string) => Promise<void>;
  
  // Conversation actions
  startConversation: () => Promise<void>;
  stopConversation: () => Promise<void>;
  sendTextMessage: (text: string) => Promise<void>;
  
  // Quiz state
  quizQuestions: any[];
  quizSummary: string | null;
  isGeneratingQuiz: boolean;
  generateQuiz: () => Promise<void>;
  toggleQuiz: () => Promise<void>;
  quizAnswers: { [key: number]: string };
  quizEvaluations: { [key: number]: any };
  quizShowAnswers: boolean;
  updateQuizAnswer: (questionIndex: number, answer: string) => void;
  updateQuizEvaluation: (questionIndex: number, evaluation: any) => void;
  saveQuizShowAnswers: (show: boolean) => void;
  resetQuiz: () => void;
  
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
  const { user } = useAuth();
  
  // Conversation state
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversationError, setConversationError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  
  // Session management
  const [activeSession, setActiveSession] = useState<ConversationSession | null>(null);
  const [allSessions, setAllSessions] = useState<ConversationSession[]>([]);
  
  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizSummary, setQuizSummary] = useState<string | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: string }>({});
  const [quizEvaluations, setQuizEvaluations] = useState<{ [key: number]: any }>({});
  const [quizShowAnswers, setQuizShowAnswers] = useState(false);
  
  // UI state
  const [activePanel, setActivePanel] = useState<'chat' | 'quiz' | 'summary' | null>('chat');

  // Load conversations when user changes
  useEffect(() => {
    if (user) {
      setActivePanel(null);
      loadConversations();
    } else {
      // Clear data when user logs out
      setAllSessions([]);
      setActiveSession(null);
      setMessages([]);
      setQuizSummary(null);
      setQuizQuestions([]);
    }
  }, [user]);

  // Load conversations from Supabase storage
  const loadConversations = async () => {
    if (!user) return;
    
    try {
      const storage = await supabaseConversationStorage.getConversations();
      const active = await supabaseConversationStorage.getActiveSession();
      
      setAllSessions(storage.sessions);
      setActiveSession(active);
      
      // Load messages from active session
      if (active) {
        setMessages(active.messages);
        setQuizSummary(active.summary || null);
        setQuizQuestions(active.quizQuestions || []);
        
        // Load quiz answers and evaluations if they exist
        if (active.quizAnswers) {
          setQuizAnswers(active.quizAnswers);
        } else {
          setQuizAnswers({});
        }
        if (active.quizEvaluations) {
          setQuizEvaluations(active.quizEvaluations);
        } else {
          setQuizEvaluations({});
        }
        if (active.quizShowAnswers !== undefined) {
          setQuizShowAnswers(active.quizShowAnswers);
        } else {
          setQuizShowAnswers(false);
        }
      } else {
        setMessages([]);
        setQuizSummary(null);
        setQuizQuestions([]);
        setQuizAnswers({});
        setQuizEvaluations({});
        setQuizShowAnswers(false);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  // Subscribe to conversation service events
  useEffect(() => {
    const unsubscribeMessages = conversationService.onMessage(async (message) => {
      setMessages(prev => [...prev, message]);
      
      // Save message to Supabase storage with session ID
      if (activeSession) {
        await supabaseConversationStorage.addMessage(message, activeSession.id);
      } else {
        console.warn('No active session to save message to');
      }
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
    };
  }, [activeSession]);

  // Session management functions
  const createNewSession = async () => {
    console.log('createNewSession called, user:', user);
    if (!user) {
      console.log('No user found, returning early');
      return;
    }
    
    try {
      console.log('Stopping current conversation if active...');
      // Stop current conversation if active
      if (isConnected) {
        stopConversation();
      }
      
      console.log('Creating new session in Supabase...');
      // Create new session
      const newSession = await supabaseConversationStorage.createSession();
      console.log('New session created:', newSession);
      
      setActiveSession(newSession);
      setMessages([]);
      setQuizSummary(null);
      setQuizQuestions([]);
      setQuizAnswers({});
      setQuizEvaluations({});
      setQuizShowAnswers(false);
      setActivePanel('chat');
      
      console.log('Reloading conversations...');
      // Reload all sessions
      await loadConversations();
      console.log('createNewSession completed successfully');
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  const switchToSession = async (sessionId: string) => {
    if (!user) return;
    
    try {
      // Stop current conversation if active
      if (isConnected) {
        stopConversation();
      }
      
      // Switch to session
      const session = await supabaseConversationStorage.switchToSession(sessionId);
      if (session) {
        setActiveSession(session);
        setMessages(session.messages);
        setQuizSummary(session.summary || null);
        setQuizQuestions(session.quizQuestions || []);
        setQuizAnswers(session.quizAnswers || {});
        setQuizEvaluations(session.quizEvaluations || {});
        setQuizShowAnswers(session.quizShowAnswers || false);
        setActivePanel(null);
        // Reload all sessions
        await loadConversations();
      }
    } catch (error) {
      console.error('Error switching session:', error);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!user) return;
    
    try {
      const success = await supabaseConversationStorage.deleteSession(sessionId);
      if (success) {
        await loadConversations();
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const updateSessionTitle = async (sessionId: string, newTitle: string) => {
    if (!user) return;
    
    try {
      await supabaseConversationStorage.updateSession(sessionId, { title: newTitle });
      await loadConversations();
    } catch (error) {
      console.error('Error updating session title:', error);
    }
  };

  // Conversation actions
  const startConversation = async () => {
    try {
      setConversationError(null);
      
      // Create new session if none exists
      if (!activeSession) {
        await createNewSession();
      }
      
      // Ensure we have an active session before starting
      if (!activeSession) {
        throw new Error('Failed to create or load active session');
      }
      
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
    if (messages.length === 0 || !activeSession) return;
    
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
      
      // Save to session
      await supabaseConversationStorage.updateSession(activeSession.id, {
        summary: data.summary,
        quizQuestions: data.questions
      });
      
      // Reload sessions to update UI
      await loadConversations();
    } catch (error) {
      console.error('Error generating quiz:', error);
      setConversationError(error instanceof Error ? error.message : 'Failed to generate quiz');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const toggleQuiz = async () => {
    // If quiz panel is currently open, close it
    if (activePanel === 'quiz') {
      setActivePanel(null);
    } 
    // If we have quiz questions already, just open the quiz panel
    else if (quizQuestions.length > 0) {
      setActivePanel('quiz');
    } 
    // If no quiz exists, generate a new one
    else {
      await generateQuiz();
    }
  };

  const updateQuizAnswer = async (questionIndex: number, answer: string) => {
    setQuizAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    
    // Save to Supabase
    if (activeSession) {
      const updatedAnswers = { ...quizAnswers, [questionIndex]: answer };
      await supabaseConversationStorage.updateSession(activeSession.id, {
        quizAnswers: updatedAnswers
      });
    }
  };

  const updateQuizEvaluation = async (questionIndex: number, evaluation: any) => {
    setQuizEvaluations(prev => ({ ...prev, [questionIndex]: evaluation }));
    
    // Save to Supabase
    if (activeSession) {
      const updatedEvaluations = { ...quizEvaluations, [questionIndex]: evaluation };
      await supabaseConversationStorage.updateSession(activeSession.id, {
        quizEvaluations: updatedEvaluations
      });
    }
  };

  const saveQuizShowAnswers = async (show: boolean) => {
    setQuizShowAnswers(show);
    
    // Save to Supabase
    if (activeSession) {
      await supabaseConversationStorage.updateSession(activeSession.id, {
        quizShowAnswers: show
      });
    }
  };

  const resetQuiz = async () => {
    setQuizAnswers({});
    setQuizEvaluations({});
    setQuizShowAnswers(false);
    
    // Save to Supabase
    if (activeSession) {
      await supabaseConversationStorage.updateSession(activeSession.id, {
        quizAnswers: {},
        quizEvaluations: {},
        quizShowAnswers: false
      });
    }
  };

  const value: AppContextType = {
    // Conversation state
    isConnected,
    isListening,
    conversationError,
    messages,
    
    // Session management
    activeSession,
    allSessions,
    createNewSession,
    switchToSession,
    deleteSession,
    updateSessionTitle,
    
    // Conversation actions
    startConversation,
    stopConversation,
    sendTextMessage,
    
    // Quiz state
    quizQuestions,
    quizSummary,
    isGeneratingQuiz,
    generateQuiz,
    toggleQuiz,
    quizAnswers,
    quizEvaluations,
    quizShowAnswers,
    updateQuizAnswer,
    updateQuizEvaluation,
    saveQuizShowAnswers,
    resetQuiz,
    
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