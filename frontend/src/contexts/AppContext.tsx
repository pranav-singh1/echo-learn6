import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { conversationService, ConversationState } from '../lib/conversation';
import { supabaseConversationStorage, ConversationSession } from '../lib/supabaseConversationStorage';
import { RetellConversation, ConversationMessage } from '../components/RetellConversation';
import { useAuth } from './AuthContext';

interface AppContextType {
  // Conversation state
  isConnected: boolean;
  isListening: boolean;
  conversationError: string | null;
  messages: ConversationMessage[];
  isMuted: boolean;
  
  // Voice session state
  isVoiceSessionActive: boolean;
  voiceSessionTranscript: string;
  isTextInputLocked: boolean;
  hasSentFirstTextAfterVoice: boolean;
  
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
  
  // Settings
  streamingEnabled: boolean;
  setStreamingEnabled: (enabled: boolean) => void;
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
  
  // Voice session state
  const [isVoiceSessionActive, setIsVoiceSessionActive] = useState(false);
  const [voiceSessionTranscript, setVoiceSessionTranscript] = useState('');
  const [isTextInputLocked, setIsTextInputLocked] = useState(false);
  const [hasSentFirstTextAfterVoice, setHasSentFirstTextAfterVoice] = useState(false);
  const [isManuallyStoppingConversation, setIsManuallyStoppingConversation] = useState(false);
  
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
  
  // Settings
  const [streamingEnabled, setStreamingEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('streamingEnabled');
      return saved !== null ? JSON.parse(saved) : true; // Default to true (streaming on)
    }
    return true;
  });
  
  // Persist streaming setting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('streamingEnabled', JSON.stringify(streamingEnabled));
    }
  }, [streamingEnabled]);
  
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



  // Load conversations when user changes - with proper ID tracking
  useEffect(() => {
    const currentUserId = user?.id || null;
    
    if (user && currentUserId !== initializedUserId) {
      setInitializedUserId(currentUserId);
      setIsInitialized(false);
      setActivePanel(null);
      initializeUserSession();
    } else if (!user && initializedUserId) {
      // Clear data when user logs out
      setAllSessions([]);
      setActiveSession(null);
      setMessages([]);
      setQuizSummary(null);
      setQuizQuestions([]);
      setInitializedUserId(null);
      setIsInitialized(false);
    } else if (user && currentUserId === initializedUserId && isInitialized) {
      // Same user and already initialized, don't re-initialize
    } else if (user && currentUserId === initializedUserId && !isInitialized) {
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
        // Ensure conversation service is properly initialized
        conversationService.clearMessages();
        conversationService.setSessionMessages(messages);
        setIsInitialized(true);
        return; // Don't clear the current session
      }
      
      // Try to load the last active session from Supabase only if we don't have one
      if (!activeSession || messages.length === 0) {
        const lastActiveSession = await supabaseConversationStorage.getActiveSession();
        if (lastActiveSession && lastActiveSession.messages.length > 0) {
          setActiveSession(lastActiveSession);
          // Loaded messages should never have typewriter effect
          setMessages(lastActiveSession.messages.map(m => ({ 
            ...m, 
            shouldTypewriter: false 
          })));
          // Initialize conversation service with loaded session messages
          conversationService.clearMessages();
          conversationService.setSessionMessages(lastActiveSession.messages);
          
          setQuizSummary(lastActiveSession.summary || null);
          setQuizQuestions(lastActiveSession.quizQuestions || []);
          setQuizAnswers(lastActiveSession.quizAnswers || {});
          setQuizEvaluations(lastActiveSession.quizEvaluations || {});
          setQuizShowAnswers(lastActiveSession.quizShowAnswers || false);
          setActivePanel(null);
        } else {
          // Only start fresh if there's no active session
          setActiveSession(null);
          setMessages([]);
          // Clear conversation service for fresh start
          conversationService.clearMessages();
          
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
        // Loaded messages should never have typewriter effect
        setMessages(active.messages.map(m => ({ 
          ...m, 
          shouldTypewriter: false 
        })));
        // Initialize conversation service with active session messages
        conversationService.clearMessages();
        conversationService.setSessionMessages(active.messages);
        
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
        // Clear conversation service when no active session
        conversationService.clearMessages();
        
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
      // Since we only display transcript messages at the end now, never use typewriter animation
      // This ensures all messages appear immediately when the transcript is displayed
      const shouldTypewriter = false; // Disable typewriter for all messages
      setMessages(prev => [...prev, { ...message, shouldTypewriter }]);
      
      // Save message to Supabase storage with session ID
      if (activeSession) {
        await supabaseConversationStorage.addMessage(message, activeSession.id);
        
        // Auto-generate title after first AI response if session has default title
        if (message.speaker === 'ai' && 
            activeSession.title === 'New Conversation' && 
            messages.length >= 1) { // Ensure we have at least user message + this AI response
          // Small delay to ensure message is saved first
          setTimeout(() => {
            generateConversationTitle();
          }, 1000);
        }
      } else if (!activeSession) {
        // No active session yet, message will be saved once session is created
      }
    });

    const unsubscribeState = conversationService.onStateChange((state) => {
      if (state.isConnected !== undefined) {
        setIsConnected(state.isConnected);
        
        // If connection is lost and we were in a voice session, handle conversation end
        // BUT only if we're not already manually stopping (to prevent duplicate messages)
        if (state.isConnected === false && isVoiceSessionActive && !isManuallyStoppingConversation) {
          handleConversationEnd(false); // Agent-initiated stop
        }
      }
      
      if (state.isListening !== undefined) setIsListening(state.isListening);
      if (state.error !== undefined) setConversationError(state.error);
    });

    // Cleanup on unmount
    return () => {
      unsubscribeMessages();
      unsubscribeState();
    };
  }, [activeSession, messages, isVoiceSessionActive, isManuallyStoppingConversation, isConnected, streamingEnabled]);

  // Shared function to handle conversation ending (both manual and agent-initiated)
  const handleConversationEnd = (isManualStop: boolean = false) => {
    // End voice session and unlock text input
    setIsVoiceSessionActive(false);
    setIsTextInputLocked(false);
    
    // Build transcript from voice session messages for later use
    const voiceMessages = messages.filter(msg => 
      msg.speaker === 'user' || msg.speaker === 'ai'
    ).map(msg => `${msg.speaker === 'user' ? 'You' : 'EchoLearn'}: ${msg.text}`).join('\n');
    
    setVoiceSessionTranscript(voiceMessages);
    
    // For agent-initiated stops, we need to manually add the "Conversation ended" message
    // since the conversationService.stopConversation() is not called in this case
    if (!isManualStop) {
      // Check if a "Conversation ended" message already exists to prevent duplicates
      const hasConversationEndedMessage = messages.some(msg => 
        msg.speaker === 'system' && msg.text === 'Conversation ended'
      );
      
      if (!hasConversationEndedMessage) {
        conversationService.addMessage({
          speaker: 'system',
          text: 'Conversation ended',
          timestamp: new Date().toLocaleTimeString(),
          messageId: `msg_${Date.now()}_${Math.random()}`
        });
      }
    }
    // For manual stops, the "Conversation ended" message is already added by conversationService.stopConversation()
  };

  // Handle transcript completion from voice conversation
  const handleTranscriptComplete = async (transcriptMessages: ConversationMessage[]) => {
    if (!activeSession) return;
    
    try {
      console.log('Handling transcript completion with', transcriptMessages.length, 'messages');
      
      // Replace existing messages with transcript messages
      setMessages(transcriptMessages.map(m => ({ ...m, shouldTypewriter: false })));
      
      // Clear conversation service and set the transcript messages
      conversationService.clearMessages();
      conversationService.setSessionMessages(transcriptMessages);
      
      // Update the session with the new transcript messages
      // This replaces all existing messages with the transcript messages
      await supabaseConversationStorage.updateSession(activeSession.id, {
        messages: transcriptMessages
      });
      
      console.log('Transcript messages saved to session:', activeSession.id);
    } catch (error) {
      console.error('Error handling transcript completion:', error);
    }
  };

  // Session management functions
  const createNewSession = async () => {
    if (!user) {
      return;
    }
    
    try {
      // Stop current conversation if active
      if (isConnected) {
        stopConversation();
      }
      
      // Clear conversation service messages to ensure fresh start
      conversationService.clearMessages();
      
      // Create new session
      const newSession = await supabaseConversationStorage.createSession();
      
      setActiveSession(newSession);
      setMessages([]);
      setQuizSummary(null);
      setQuizQuestions([]);
      setQuizAnswers({});
      setQuizEvaluations({});
      setQuizShowAnswers(false);
      setActivePanel('chat');
      
      // Reload all sessions
      await loadConversations();
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  // Start a fresh conversation view without creating a session
  const startFreshConversation = () => {
    // Stop current conversation if active
    if (isConnected) {
      stopConversation();
    }
    
    // Clear conversation service messages
    conversationService.clearMessages();
    
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
    if (!user) return;
    
    try {
      // Stop current conversation if active
      if (isConnected) {
        stopConversation();
      }
      
      // Clear conversation service messages to ensure fresh start
      conversationService.clearMessages();
      
      // Always create a new session regardless of existing ones
      const newSession = await supabaseConversationStorage.createSession();
      
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
        // Clear conversation service and set the new session's messages
        conversationService.clearMessages();
        conversationService.setSessionMessages(session.messages);
        
        setActiveSession(session);
        // Loaded messages should never have typewriter effect
        setMessages(session.messages.map(m => ({ 
          ...m, 
          shouldTypewriter: false 
        })));
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
        
        // Clear conversation service and initialize with empty messages
        conversationService.clearMessages();
        
        // Reload all sessions to include the new one
        const updatedStorage = await supabaseConversationStorage.getConversations();
        setAllSessions(updatedStorage.sessions);
      } else {
        // Set current session messages in conversation service
        conversationService.setSessionMessages(messages);
      }
      
      // Start voice session and lock text input
      setIsVoiceSessionActive(true);
      setIsTextInputLocked(true);
      setHasSentFirstTextAfterVoice(false);
      setVoiceSessionTranscript('');
      
      await conversationService.startConversation();
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setConversationError(error instanceof Error ? error.message : 'Failed to start conversation');
      
      // Reset voice session state on error
      setIsVoiceSessionActive(false);
      setIsTextInputLocked(false);
    }
  };

  const stopConversation = async () => {
    try {
      // Set flag to prevent state change listener from adding duplicate message
      setIsManuallyStoppingConversation(true);
      
      // Stop the conversation service first
      await conversationService.stopConversation();
      
      // Handle the conversation end with manual stop flag
      // This will add the "Conversation ended" message if needed
      handleConversationEnd(true);
      
    } catch (error) {
      console.error('Failed to stop conversation:', error);
      
      // Reset voice session state on error
      setIsVoiceSessionActive(false);
      setIsTextInputLocked(false);
    } finally {
      // Always clear the manual stop flag
      setIsManuallyStoppingConversation(false);
    }
  };

  const sendTextMessage = async (text: string) => {
    try {
      // Create new session if none exists (when user sends first message)
      if (!activeSession) {
        const newSession = await supabaseConversationStorage.createSession();
        setActiveSession(newSession);
        
        // Clear conversation service and initialize with empty messages
        conversationService.clearMessages();
        
        // Reload all sessions to include the new one
        const updatedStorage = await supabaseConversationStorage.getConversations();
        setAllSessions(updatedStorage.sessions);
      } else {
        // Ensure conversation service has current session messages
        conversationService.setSessionMessages(messages);
      }
      
      // Check if this is the first text message after a voice session
      if (!hasSentFirstTextAfterVoice && voiceSessionTranscript && voiceSessionTranscript.trim()) {
        
        // Add the user's message to the UI first (what they actually typed)
        const userMessage = {
          speaker: 'user' as const,
          text: text,
          timestamp: new Date().toLocaleTimeString(),
          messageId: `msg_${Date.now()}_${Math.random()}`
        };
        
        // Add user message to UI
        conversationService.addMessage(userMessage);
        
        // Send the transcript context along with the user's message to the API
        const contextMessage = `Voice Session Transcript:\n${voiceSessionTranscript}\n\nUser's Text Message: ${text}`;
        
        // Call the chat API with the context but don't display it in UI
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: contextMessage,
            conversationHistory: messages.slice(-10) // Send last 10 messages from current session only
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get AI response');
        }

        const data = await response.json();
        const aiResponse = data.response;

        // Add AI response to UI
        conversationService.addMessage({
          speaker: 'ai' as const,
          text: aiResponse,
          timestamp: new Date().toLocaleTimeString(),
          messageId: `msg_${Date.now()}_${Math.random()}`
        });
        
        // Mark that we've sent the first text message after voice
        setHasSentFirstTextAfterVoice(true);
        setVoiceSessionTranscript(''); // Clear the transcript after use
      } else {
        // Normal text message - conversation service will handle the API call with proper session isolation
        await conversationService.sendTextMessage(text);
      }
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
          const speaker = msg.speaker === 'user' ? 'Student' : 'Tutor';
          return `${speaker}: ${msg.text}`;
        });

        const response = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ log: conversationLog }),
        });

        if (!response.ok) {
          // Try to parse the error response, but have a fallback.
          try {
              const errorData = await response.json();
              
              // Handle specific case where no educational content is found
              if (errorData.error === 'No educational content found') {
                setQuizQuestions([]);
                setQuizSummary(null);
                setQuizBlocked(errorData.reason || 'The conversation does not contain sufficient educational content for quiz generation. Try discussing a topic you want to learn about!');
                setIsGeneratingQuiz(false);
                return;
              }
              
              throw new Error(errorData.error || `Request failed with status ${response.status}`);
          } catch (e) {
              // If the error response is not JSON, use the status text.
              throw new Error(response.statusText || `Request failed with status ${response.status}`);
          }
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
    }, 1000);
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
    // Keep the same questions, only reset answers and evaluations
    setQuizAnswers({});
    setQuizEvaluations({});
    setQuizShowAnswers(false);
    
    // Save to Supabase
    if (activeSession) {
      await supabaseConversationStorage.updateSession(activeSession.id, {
        quizAnswers: {},
        quizEvaluations: {},
        quizShowAnswers: false
        // Note: We keep quizQuestions and summary unchanged
      });
    }
  };

  const generateConversationTitle = async () => {
    if (messages.length === 0 || !activeSession) return;
    
    try {
      const response = await fetch('/api/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        try {
            const errorData = await response.json();
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        } catch (e) {
            throw new Error(response.statusText || `Request failed with status ${response.status}`);
        }
      }

      const data = await response.json();
      
      // Update session title
      if (activeSession && data.title) {
        await updateSessionTitle(activeSession.id, data.title);
      }
    } catch (error) {
      console.error('Error generating conversation title:', error);
      // Don't show error to user for title generation failures
    }
  };

  // Generate conversation title from transcript (for voice conversations)
  const generateConversationTitleFromTranscript = async (transcript: string) => {
    if (!activeSession) {
      console.log('No active session for title generation');
      return;
    }
    
    try {
      console.log('Generating title from transcript for session:', activeSession.id);
      
      // Convert transcript to messages format for the title API
      const lines = transcript.split('\n').filter(line => line.trim());
      const transcriptMessages = lines.map(line => {
        const speaker = line.startsWith('EchoLearn:') ? 'ai' : 'user';
        const text = line.replace(/^(EchoLearn|You):\s*/, '');
        return {
          speaker,
          text: text.trim(),
          timestamp: new Date().toLocaleTimeString(),
          messageId: `msg_${Date.now()}_${Math.random()}`
        };
      });

      console.log('Converted transcript to', transcriptMessages.length, 'messages');

      const response = await fetch('/api/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: transcriptMessages }),
      });

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
        console.log('Session title updated successfully');
      }
    } catch (error) {
      console.error('Error generating conversation title from transcript:', error);
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
    
    // Voice session state
    isVoiceSessionActive,
    voiceSessionTranscript,
    isTextInputLocked,
    hasSentFirstTextAfterVoice,
    
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
    
    // Settings
    streamingEnabled,
    setStreamingEnabled,
  };

  return (
    <AppContext.Provider value={value}>
      <RetellConversation
        onMessage={(message) => conversationService.addMessage(message)}
        onStateChange={(state) => conversationService.updateState(state)}
        onStart={() => {}}
        onStop={() => {}}
        onGenerateTitle={generateConversationTitleFromTranscript}
        onTranscriptComplete={handleTranscriptComplete}
      />
      {children}
    </AppContext.Provider>
  );
}; 