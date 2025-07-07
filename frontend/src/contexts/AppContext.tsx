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
  isMuted: boolean;
  
  // Session management
  activeSession: ConversationSession | null;
  allSessions: ConversationSession[];
  createNewSession: () => Promise<void>;
  createFreshSession: () => Promise<void>;
  startFreshConversation: () => void;
  switchToSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  updateSessionTitle: (sessionId: string, newTitle: string) => Promise<void>;
  generateConversationTitle: () => Promise<void>;
  
  // Conversation actions
  startConversation: () => Promise<void>;
  stopConversation: () => Promise<void>;
  sendTextMessage: (text: string) => Promise<void>;
  toggleMute: () => Promise<void>;
  
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
  quizBlocked: string | null;
  
  // UI state
  activePanel: 'chat' | 'quiz' | 'summary' | null;
  setActivePanel: (panel: 'chat' | 'quiz' | 'summary' | null) => void;
  highlightTerm: string;
  setHighlightTerm: (term: string) => void;
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
  const [isMuted, setIsMuted] = useState(false);
  
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
  const [quizBlocked, setQuizBlocked] = useState<string | null>(null);
  
  // UI state
  const [activePanel, setActivePanel] = useState<'chat' | 'quiz' | 'summary' | null>(null);
  // Search highlight state
  const [highlightTerm, setHighlightTerm] = useState<string>('');
  
  // Track initialization to prevent unnecessary reloads
  const [initializedUserId, setInitializedUserId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Only persist quiz/summary panel state if open, otherwise always default to chat/null
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (activePanel === 'quiz' || activePanel === 'summary') {
        localStorage.setItem('activePanel', activePanel);
      } else {
        localStorage.removeItem('activePanel');
      }
    }
  }, [activePanel]);

  // Debug effect to track quizSummary changes
  useEffect(() => {
    console.log('quizSummary state changed to:', quizSummary);
  }, [quizSummary]);

  // Debug effect to track quizQuestions changes
  useEffect(() => {
    console.log('quizQuestions state changed to:', quizQuestions);
  }, [quizQuestions]);

  // Load conversations when user changes - with proper ID tracking
  useEffect(() => {
    const currentUserId = user?.id || null;
    
    console.log('User effect triggered:', { 
      currentUserId, 
      initializedUserId, 
      isInitialized, 
      userExists: !!user 
    });
    
    if (user && currentUserId !== initializedUserId) {
      console.log('User changed or first initialization, initializing session for user:', currentUserId);
      setInitializedUserId(currentUserId);
      setIsInitialized(false);
      setActivePanel(null);
      initializeUserSession();
    } else if (!user && initializedUserId) {
      console.log('User logged out, clearing data');
      // Clear data when user logs out
      setAllSessions([]);
      setActiveSession(null);
      setMessages([]);
      setQuizSummary(null);
      setQuizQuestions([]);
      setInitializedUserId(null);
      setIsInitialized(false);
    } else if (user && currentUserId === initializedUserId && isInitialized) {
      console.log('Same user detected and already initialized, preserving session state');
      // Same user and already initialized, don't re-initialize
    } else if (user && currentUserId === initializedUserId && !isInitialized) {
      console.log('Same user but not initialized yet, completing initialization');
      // This handles the case where the user object reference changed but it's the same user
      // and we haven't finished initialization yet
    }
  }, [user?.id, initializedUserId, isInitialized]);

  // Initialize user session - load existing sessions and preserve active session if it exists
  const initializeUserSession = async () => {
    if (!user) return;
    
    console.log('=== initializeUserSession called ===');
    console.log('Current activeSession:', activeSession?.id);
    console.log('Current messages count:', messages.length);
    console.log('User ID:', user.id);
    console.log('Is initialized:', isInitialized);
    
    try {
      // Load existing sessions first for the sidebar
      const storage = await supabaseConversationStorage.getConversations();
      setAllSessions(storage.sessions);
      console.log('Loaded sessions:', storage.sessions.length);
      
      // If we already have an active session with messages, preserve it (e.g., from tab switching)
      if (activeSession && messages.length > 0 && isInitialized) {
        console.log('Preserving existing active session during tab switch:', activeSession.id);
        setIsInitialized(true);
        return; // Don't clear the current session
      }
      
      // Try to load the last active session from Supabase only if we don't have one
      if (!activeSession || messages.length === 0) {
        const lastActiveSession = await supabaseConversationStorage.getActiveSession();
        console.log('Last active session from Supabase:', lastActiveSession?.id);
        
        if (lastActiveSession && lastActiveSession.messages.length > 0) {
          console.log('Loading last active session:', lastActiveSession.id);
          setActiveSession(lastActiveSession);
          setMessages(lastActiveSession.messages);
          setQuizSummary(lastActiveSession.summary || null);
          setQuizQuestions(lastActiveSession.quizQuestions || []);
          setQuizAnswers(lastActiveSession.quizAnswers || {});
          setQuizEvaluations(lastActiveSession.quizEvaluations || {});
          setQuizShowAnswers(lastActiveSession.quizShowAnswers || false);
          setActivePanel(null);
        } else {
          // Only start fresh if there's no active session
          console.log('No active session found - starting fresh');
          setActiveSession(null);
          setMessages([]);
          setQuizSummary(null);
          setQuizQuestions([]);
          setQuizAnswers({});
          setQuizEvaluations({});
          setQuizShowAnswers(false);
          setActivePanel(null);
        }
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing user session:', error);
      setIsInitialized(true);
    }
  };

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
      
      // Save message to Supabase storage with session ID (only for complete messages)
      if (activeSession && !message.isStreaming) {
        await supabaseConversationStorage.addMessage(message, activeSession.id);
        
        // Auto-generate title after first AI response if session has default title
        if (message.speaker === 'ai' && 
            activeSession.title === 'New Conversation' && 
            messages.length >= 1) { // Ensure we have at least user message + this AI response
          console.log('Triggering auto title generation after first AI response');
          // Small delay to ensure message is saved first
          setTimeout(() => {
            generateConversationTitle();
          }, 1000);
        }
      } else if (activeSession && message.isStreaming) {
        // For streaming messages, we'll save them when they're complete
        console.log('Streaming message started, will save when complete');
      } else if (!activeSession) {
        console.log('No active session yet, message will be saved once session is created');
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
  }, [activeSession, messages]);

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

  // Start a fresh conversation view without creating a session
  const startFreshConversation = () => {
    console.log('Starting fresh conversation view (no session created yet)');
    
    // Stop current conversation if active
    if (isConnected) {
      stopConversation();
    }
    
    // Clear all state to show fresh "New Conversation"
    setActiveSession(null);
    setMessages([]);
    setQuizSummary(null);
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizEvaluations({});
    setQuizShowAnswers(false);
    setActivePanel('chat');
  };

  // Force create a fresh session (used when transitioning from landing page)
  const createFreshSession = async () => {
    console.log('createFreshSession called - forcing new session creation');
    if (!user) return;
    
    try {
      // Stop current conversation if active
      if (isConnected) {
        stopConversation();
      }
      
      // Always create a new session regardless of existing ones
      const newSession = await supabaseConversationStorage.createSession();
      console.log('Fresh session created:', newSession);
      
      setActiveSession(newSession);
      setMessages([]);
      setQuizSummary(null);
      setQuizQuestions([]);
      setQuizAnswers({});
      setQuizEvaluations({});
      setQuizShowAnswers(false);
      setActivePanel('chat');
      
      // Reload all sessions
      const updatedStorage = await supabaseConversationStorage.getConversations();
      setAllSessions(updatedStorage.sessions);
    } catch (error) {
      console.error('Error creating fresh session:', error);
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
      
      // If the current session already has a completed conversation, create a new session
      const hasEnded = messages.some(
        (msg) => msg.speaker === 'system' && msg.text === 'Conversation ended'
      );
      if (activeSession && hasEnded) {
        await createNewSession();
      }
      
      // Create new session if none exists (when user actually starts conversation)
      if (!activeSession) {
        console.log('Creating new session as user is starting conversation');
        const newSession = await supabaseConversationStorage.createSession();
        setActiveSession(newSession);
        
        // Reload all sessions to include the new one
        const updatedStorage = await supabaseConversationStorage.getConversations();
        setAllSessions(updatedStorage.sessions);
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
      // Create new session if none exists (when user sends first message)
      if (!activeSession) {
        console.log('Creating new session as user is sending first message');
        const newSession = await supabaseConversationStorage.createSession();
        setActiveSession(newSession);
        
        // Reload all sessions to include the new one
        const updatedStorage = await supabaseConversationStorage.getConversations();
        setAllSessions(updatedStorage.sessions);
      }
      
      await conversationService.sendTextMessage(text);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Quiz actions
  const generateQuiz = async () => {
    setActivePanel('quiz');
    setIsGeneratingQuiz(true);
    setQuizBlocked(null);
    // Wait 1 second before checking message count or making API call
    setTimeout(async () => {
      if (messages.length < 3 || !activeSession) {
        setQuizQuestions([]);
        setQuizSummary(null);
        setQuizBlocked('You can only generate a quiz after actually conversing with the agent.');
        setIsGeneratingQuiz(false);
        return;
      }
      setQuizBlocked(null);
      try {
        // Convert messages to the format expected by the backend
        const conversationLog = messages.map(msg => {
          const speaker = msg.speaker === 'user' ? 'You' : 'Echo Learn';
          return `${speaker}: ${msg.text}`;
        });

        console.log('Sending quiz generation request with log:', conversationLog);

        const response = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ log: conversationLog }),
        });

        console.log('Quiz API response status:', response.status);
        console.log('Quiz API response ok:', response.ok);

        if (!response.ok) {
          // Try to parse the error response, but have a fallback.
          try {
              const errorData = await response.json();
              throw new Error(errorData.error || `Request failed with status ${response.status}`);
          } catch (e) {
              // If the error response is not JSON, use the status text.
              throw new Error(response.statusText || `Request failed with status ${response.status}`);
          }
        }

        const data = await response.json();
        console.log('Quiz API response data:', data);
        console.log('Summary from API:', data.summary);
        console.log('Questions from API:', data.questions);
        
        setQuizSummary(data.summary);
        setQuizQuestions(data.questions);
        setActivePanel('quiz');
        
        // Save to session
        await supabaseConversationStorage.updateSession(activeSession.id, {
          summary: data.summary,
          quizQuestions: data.questions
        });
        
        console.log('Successfully saved summary and questions to session');
        
        // Reload sessions to update UI
        await loadConversations();
        
        console.log('Quiz generation completed successfully');
        console.log('Current quizSummary state:', data.summary);
        console.log('Current quizQuestions state:', data.questions);
      } catch (error) {
        console.error('Error generating quiz:', error);
        setConversationError(error instanceof Error ? error.message : 'Failed to generate quiz');
      } finally {
        setIsGeneratingQuiz(false);
      }
    }, 1000);
  };

  const toggleQuiz = async () => {
    console.log('toggleQuiz called');
    console.log('activePanel:', activePanel);
    console.log('quizQuestions.length:', quizQuestions.length);
    console.log('Current quizSummary:', quizSummary);
    
    // If quiz panel is currently open, close it
    if (activePanel === 'quiz') {
      console.log('Closing quiz panel');
      setActivePanel(null);
    } 
    // If we have quiz questions already, just open the quiz panel
    else if (quizQuestions.length > 0) {
      console.log('Opening existing quiz');
      setActivePanel('quiz');
    } 
    // If no quiz exists, generate a new one
    else {
      console.log('Generating new quiz');
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

  const generateConversationTitle = async () => {
    if (messages.length === 0 || !activeSession) return;
    
    try {
      console.log('Generating conversation title for session:', activeSession.id);

      const response = await fetch('/api/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      console.log('Title API response status:', response.status);

      if (!response.ok) {
        try {
            const errorData = await response.json();
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        } catch (e) {
            throw new Error(response.statusText || `Request failed with status ${response.status}`);
        }
      }

      const data = await response.json();
      console.log('Generated title:', data.title);
      
      // Update session title
      if (activeSession && data.title) {
        await updateSessionTitle(activeSession.id, data.title);
      }
      
      console.log('Conversation title updated successfully');
    } catch (error) {
      console.error('Error generating conversation title:', error);
      // Don't show error to user for title generation failures
    }
  };

  const toggleMute = async () => {
    await conversationService.toggleMute();
    setIsMuted(conversationService.isMicMuted());
  };

  const value: AppContextType = {
    // Conversation state
    isConnected,
    isListening,
    conversationError,
    messages,
    isMuted,
    
    // Session management
    activeSession,
    allSessions,
    createNewSession,
    createFreshSession,
    startFreshConversation,
    switchToSession,
    deleteSession,
    updateSessionTitle,
    generateConversationTitle,
    
    // Conversation actions
    startConversation,
    stopConversation,
    sendTextMessage,
    toggleMute,
    
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
    quizBlocked,
    
    // UI state
    activePanel,
    setActivePanel,
    highlightTerm,
    setHighlightTerm,
  };

  return (
    <AppContext.Provider value={value}>
      {/* ElevenLabs conversation component */}
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