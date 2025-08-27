import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { conversationService, ConversationState } from '../lib/conversation';
import { supabaseConversationStorage, ConversationSession } from '../lib/supabaseConversationStorage';
import { VapiConversation, ConversationMessage } from '../components/VapiConversation';
import { useAuth } from './AuthContext';
import { SubscriptionService } from '../lib/subscription';

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
  
  // Learning mode state
  learningMode: 'conversation' | 'blurting' | 'teaching';
  setLearningMode: (mode: 'conversation' | 'blurting' | 'teaching') => void;
  
  // New chat state
  wantsNewChat: boolean;
  setWantsNewChat: (wants: boolean) => void;
  
  // Blurting state
  blurtContent: string;
  setBlurtContent: (content: string) => void;
  blurtFeedback: any;
  setBlurtFeedback: (feedback: any) => void;
  isBlurtCompleted: boolean;
  setIsBlurtCompleted: (completed: boolean) => void;
  
  // Blurting actions
  submitBlurt: (content: string, topic?: string) => Promise<void>;
  startBlurtMode: () => void;
  createBlurtingSession: () => Promise<void>;
  
  // Teaching state
  teachingContent: string;
  setTeachingContent: (content: string) => void;
  teachingFeedback: any;
  setTeachingFeedback: (feedback: any) => void;
  isTeachingCompleted: boolean;
  setIsTeachingCompleted: (completed: boolean) => void;
  
  // Teaching actions
  submitTeaching: (content: string, topic?: string) => Promise<void>;
  startTeachingMode: () => void;
  createTeachingSession: (topic?: string) => Promise<void>;
  
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
  dailyQuizUsage: { current: number; max: number } | null;
  
  // UI state
  activePanel: 'chat' | 'quiz' | 'summary' | null;
  setActivePanel: (panel: 'chat' | 'quiz' | 'summary' | null) => void;
  highlightTerm: string;
  setHighlightTerm: (term: string) => void;
  
  // Settings
  streamingEnabled: boolean;
  setStreamingEnabled: (enabled: boolean) => void;
  typewriterSpeed: 'slow' | 'regular' | 'fast';
  setTypewriterSpeed: (speed: 'slow' | 'regular' | 'fast') => void;
  
  // Subscription management
  userPlan: string;
  planLimits: any;
  checkFeatureAccess: (feature: string) => Promise<boolean>;
  incrementFeatureUsage: (feature: string) => Promise<void>;
  loadUserPlan: () => Promise<void>;
  
  // App initialization
  isInitialized: boolean;
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
  
  // Learning mode state
  const [learningMode, setLearningMode] = useState<'conversation' | 'blurting' | 'teaching'>('conversation');
  
  // New chat state
  const [wantsNewChat, setWantsNewChat] = useState(false);
  
  // Blurting state
  const [blurtContent, setBlurtContent] = useState('');
  const [blurtFeedback, setBlurtFeedback] = useState<any>(null);
  const [isBlurtCompleted, setIsBlurtCompleted] = useState(false);
  
  // Teaching state
  const [teachingContent, setTeachingContent] = useState('');
  const [teachingFeedback, setTeachingFeedback] = useState<any>(null);
  const [isTeachingCompleted, setIsTeachingCompleted] = useState(false);
  

  
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
  const [dailyQuizUsage, setDailyQuizUsage] = useState<{ current: number; max: number } | null>(null);
  
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

  const [typewriterSpeed, setTypewriterSpeed] = useState<'slow' | 'regular' | 'fast'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typewriterSpeed');
      return (saved as 'slow' | 'regular' | 'fast') || 'regular';
    }
    return 'regular';
  });
  
  // Subscription state
  const [userPlan, setUserPlan] = useState<string>('free');
  const [planLimits, setPlanLimits] = useState<any>(null);
  
  // App initialization state
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Persist streaming setting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('streamingEnabled', JSON.stringify(streamingEnabled));
    }
  }, [streamingEnabled]);

  // Persist typewriter speed setting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('typewriterSpeed', typewriterSpeed);
    }
  }, [typewriterSpeed]);
  


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



  // Simple initialization: Load sessions and show most recent one
  useEffect(() => {
    if (!user) return;
    
    const initializeApp = async () => {
      console.log('Initializing app for user:', user.id);
      
      // Load user subscription plan and daily usage
      await loadUserPlan();
      
      // Load all sessions
      const storage = await supabaseConversationStorage.getConversations();
      setAllSessions(storage.sessions);
      
      // Always start with mode selector, regardless of existing sessions
      console.log('Starting with mode selector');
      setWantsNewChat(true);
      setActiveSession(null);
      setMessages([]);
      setIsInitialized(true);
    };
    
    initializeApp();
  }, [user?.id]);

  // Helper function to load conversations
  const loadConversations = async () => {
    if (!user) return;
    const storage = await supabaseConversationStorage.getConversations();
    setAllSessions(storage.sessions);
  };


  // Subscribe to conversation service events
  useEffect(() => {
    const unsubscribeMessages = conversationService.onMessage(async (message) => {
      // Disable typewriter completely to prevent any potential issues
      const shouldTypewriter = false;

      // NEW BUFFER APPROACH: Handle live message updates by messageId
      setMessages(prev => {
        // Check if this is an update to an existing message (same messageId)
        const existingIndex = prev.findIndex(m => m.messageId === message.messageId);
        
        if (existingIndex !== -1) {
          // UPDATE existing message
          const updatedMessages = [...prev];
          updatedMessages[existingIndex] = { ...message, shouldTypewriter };
          console.log(`UPDATED message: "${message.text}" from ${message.speaker}`);
          return updatedMessages;
        } else {
          // NEW message
          console.log(`NEW message: "${message.text}" from ${message.speaker}`);
          return [...prev, { ...message, shouldTypewriter }];
        }
      });
      
      // Save message to Supabase storage with session ID
      if (activeSession) {
        await supabaseConversationStorage.addMessage(message, activeSession.id);
        
        // COMPLETELY DISABLED: No auto-title generation during message handling
        // Titles will ONLY be generated at conversation end for voice conversations
        // or manually triggered for text conversations
        console.log('Auto-title generation COMPLETELY DISABLED during message handling to prevent spam');
      } else if (!activeSession) {
        // No active session yet, message will be saved once session is created
      }
    });

    const unsubscribeState = conversationService.onStateChange((state) => {
      if (state.isConnected !== undefined) {
        setIsConnected(state.isConnected);
        
        // If connection is lost and we were in a voice session, handle conversation end
        if (state.isConnected === false && isVoiceSessionActive && !isManuallyStoppingConversation) {
          console.log('CONVERSATION DEBUG: Auto-ending conversation due to connection loss');
          handleConversationEnd(false); // Agent-initiated stop
        } else if (state.isConnected === false && isManuallyStoppingConversation) {
          console.log('CONVERSATION DEBUG: Skipping auto-end because manual stop is in progress');
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
    
    // Add single "Conversation ended" message for both manual and agent stops
    // Check if a "Conversation ended" message already exists to prevent duplicates
    const hasConversationEndedMessage = messages.some(msg => 
      msg.speaker === 'system' && msg.text === 'Conversation ended'
    );
    
    console.log('🔍 CONVERSATION DEBUG: Checking for existing "Conversation ended" message');
    console.log('🔍 CONVERSATION DEBUG: Has ended message?', hasConversationEndedMessage);
    console.log('🔍 CONVERSATION DEBUG: Current messages count:', messages.length);
    console.log('🔍 CONVERSATION DEBUG: Current messages:', messages.map(m => `${m.speaker}: ${m.text.substring(0, 50)}...`));
    console.log('🔍 CONVERSATION DEBUG: Manual stop?', isManualStop);
    
    if (!hasConversationEndedMessage) {
      console.log('CONVERSATION DEBUG: Adding "Conversation ended" message');
      conversationService.addMessage({
        speaker: 'system',
        text: 'Conversation ended',
        timestamp: new Date().toLocaleTimeString(),
        messageId: `conversation_ended_${Date.now()}`
      });
    } else {
      console.log('CONVERSATION DEBUG: Skipping "Conversation ended" - already exists');
    }
  };

  // Handle transcript completion from voice conversation
  const handleTranscriptComplete = async (transcriptMessages: ConversationMessage[]) => {
    if (!activeSession) return;
    
    try {
      console.log('Handling transcript completion with', transcriptMessages.length, 'raw messages');
      
      // DON'T replace the UI messages - they're already nicely grouped!
      // Just save the raw transcript messages to session for quiz generation
      const markedTranscriptMessages = transcriptMessages.map(m => ({ 
        ...m, 
        isTranscriptMessage: true,
        shouldTypewriter: false 
      }));
      
      // Update the session with transcript messages for quiz generation
      // but keep the grouped UI messages intact
      await supabaseConversationStorage.updateSession(activeSession.id, {
        messages: markedTranscriptMessages  // Raw transcript for quiz
      });
      
      console.log('Raw transcript saved to session for quiz generation:', activeSession.id);
      console.log('UI messages remain nicely grouped');
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
      
      // Reset title generation flag
      titleGeneratedRef.current = false;
      
      // Create new session with current learning mode
      const newSession = await supabaseConversationStorage.createSession(undefined, learningMode);
      
      setActiveSession(newSession);
      setMessages([]);
      setQuizSummary(null);
      setQuizQuestions([]);
      setQuizAnswers({});
      setQuizEvaluations({});
      setQuizShowAnswers(false);
      setActivePanel('chat');
      
      // Update sessions list to show new session in sidebar
      const updatedStorage = await supabaseConversationStorage.getConversations();
      setAllSessions(updatedStorage.sessions);
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
    
    // Reset learning mode and blurting state
    setLearningMode('conversation');
    setBlurtContent('');
    setBlurtFeedback(null);
    setIsBlurtCompleted(false);
    
    // Set flag to show mode selector
    setWantsNewChat(true);
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
      const newSession = await supabaseConversationStorage.createSession(undefined, learningMode);
      
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
    
    console.log('Switching to session:', sessionId);
    console.log('Current learning mode before switch:', learningMode);
    
    try {
      // Stop current conversation if active
      if (isConnected) {
        stopConversation();
      }
      
      // Switch to session
      const session = await supabaseConversationStorage.switchToSession(sessionId);
      if (session) {
        console.log('Session switched successfully:', session.id);
        
        // Reset title generation flag for new session
        titleGeneratedRef.current = false;
        
        // Set all session data
        setActiveSession(session);
        setMessages(session.messages.map(m => ({ ...m, shouldTypewriter: false })));
        setQuizSummary(session.summary || null);
        setQuizQuestions(session.quizQuestions || []);
        setQuizAnswers(session.quizAnswers || {});
        setQuizEvaluations(session.quizEvaluations || {});
        setQuizShowAnswers(session.quizShowAnswers || false);
        setActivePanel(null);
        
        // Always set learning mode from session
        setLearningMode(session.learningMode || 'conversation');
        
        // Set blurting state
        setBlurtContent(session.blurtContent || '');
        setBlurtFeedback(session.blurtFeedback || null);
        setIsBlurtCompleted(session.isBlurtCompleted || false);
        
        // Set teaching state
        setTeachingContent(session.teachingContent || '');
        setTeachingFeedback(session.teachingFeedback || null);
        setIsTeachingCompleted(session.isTeachingCompleted || false);
        
        // Clear mode selector
        setWantsNewChat(false);
        
        // Update sessions list
        const updatedStorage = await supabaseConversationStorage.getConversations();
        setAllSessions(updatedStorage.sessions);
        
        console.log('Session switch complete - activeSession:', session.id);
        console.log('Learning mode after switch:', session.learningMode);
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
        
        // Reload all sessions to include the new one (but don't await this)
        supabaseConversationStorage.getConversations().then(updatedStorage => {
          setAllSessions(updatedStorage.sessions);
        }).catch(error => {
          console.error('Error reloading sessions:', error);
        });
      } else {
        // Set current session messages in conversation service
        conversationService.setSessionMessages(messages);
      }
      
      // Start voice session and lock text input
      setIsVoiceSessionActive(true);
      setIsTextInputLocked(true);
      setHasSentFirstTextAfterVoice(false);
      setVoiceSessionTranscript('');
      
      // Start the actual voice conversation
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
      console.log('CONVERSATION DEBUG: Manual stop - calling handleConversationEnd');
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
            conversationHistory: messages.slice(-10), // Send last 10 messages from current session only
            learningMode,
            userId: user?.id
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
        // Handle different learning modes
        if (learningMode === 'teaching') {
          // Use teaching API for interactive teaching conversation
          await submitTeaching(text);
        } else {
          // Normal text message - conversation service will handle the API call with proper session isolation
          await conversationService.sendTextMessage(text, learningMode);
        }
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

    // Clear previous quiz immediately so UI reflects a fresh generation
    setQuizSummary(null);
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizEvaluations({});
    setQuizShowAnswers(false);

    // Also clear any persisted quiz data on the session to avoid visual confusion
    if (activeSession) {
      try {
        await supabaseConversationStorage.updateSession(activeSession.id, {
          summary: null,
          quizQuestions: [],
          quizAnswers: {},
          quizEvaluations: {},
          quizShowAnswers: false
        });
      } catch (e) {
        console.error('Failed clearing existing quiz from session before regeneration:', e);
      }
    }

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
        let contentForQuiz = messages.map(msg => {
          const speaker = msg.speaker === 'user' ? 'Student' : 'Tutor';
          return `${speaker}: ${msg.text}`;
        });

        // Include blurt content if in blurting mode
        if (learningMode === 'blurting' && blurtContent) {
          contentForQuiz = [`Blurt Content:\n${blurtContent}\n\nConversation:\n${contentForQuiz.join('\n')}`];
        }

        const response = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            log: contentForQuiz,
            userId: user?.id 
          }),
        });

        // Debug logging
        console.log('Quiz request sent with userId:', user?.id);
        console.log('User object:', user);

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
              
              // Handle subscription limit errors
              if (response.status === 403 && errorData.error && errorData.error.includes('daily quiz generation limit')) {
                // Show toast notification instead of persistent error
                const { toast } = await import('../hooks/use-toast');
                toast({
                  title: "Daily Limit Reached",
                  description: errorData.error,
                  variant: "destructive",
                });
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
        
        // Refresh daily usage count
        await checkDailyQuizUsage();
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

  // Flag to prevent multiple title generation calls
  const titleGeneratedRef = useRef(false);

  // Simple title generation for voice conversations
  const generateConversationTitleFromTranscript = async () => {
    console.log('TITLE: Generating title after voice conversation');
    
    if (!activeSession) {
      console.log('TITLE: No active session');
      return;
    }
    
    // Prevent multiple calls for the same session
    if (titleGeneratedRef.current) {
      console.log('TITLE: Already generated for this session');
      return;
    }
    
    // Get conversation messages (exclude system messages)
    const conversationMessages = messages.filter(msg => msg.speaker !== 'system');
    
    if (conversationMessages.length < 2) {
      console.log('TITLE: Not enough messages for title generation');
      return;
    }
    
    // Skip if already has a custom title
    if (activeSession.title !== 'New Conversation') {
      console.log('TITLE: Session already has title:', activeSession.title);
      return;
    }
    
    // Set flag to prevent duplicate calls
    titleGeneratedRef.current = true;
    
    try {
      console.log('TITLE: Calling OpenAI API...');
      
      const response = await fetch('/api/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationMessages }),
      });

      if (!response.ok) {
        throw new Error(`Title API failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('TITLE: Generated:', data.title);
      
      // Update the session title
      if (data.title) {
        await updateSessionTitle(activeSession.id, data.title);
        
        // Refresh sessions list
        const updatedStorage = await supabaseConversationStorage.getConversations();
        setAllSessions(updatedStorage.sessions);
      }
    } catch (error) {
      console.error('TITLE: Failed to generate title:', error);
    }
  };

  const toggleMute = async () => {
    await conversationService.toggleMute();
    setIsMuted(conversationService.isMicMuted());
  };

  // Create a dedicated blurting session (bypasses voice session logic)
  const createBlurtingSession = async () => {
    if (!user) {
      return;
    }
    
    try {
      // Create new session with blurting mode (no voice session interference)
      const newSession = await supabaseConversationStorage.createSession(undefined, 'blurting');
      
      console.log('Created blurting session:', newSession);
      console.log('Session learning mode:', newSession.learningMode);
      console.log('Session isBlurtCompleted:', newSession.isBlurtCompleted);
      
      setActiveSession(newSession);
      setMessages([]);
      setQuizSummary(null);
      setQuizQuestions([]);
      setQuizAnswers({});
      setQuizEvaluations({});
      setQuizShowAnswers(false);
      // Don't set activePanel to 'chat' - let it stay on blurting interface
      
      // Reset blurting state
      setBlurtContent('');
      setBlurtFeedback(null);
      setIsBlurtCompleted(false);
      
      // Update sessions list to show new session in sidebar
      const updatedStorage = await supabaseConversationStorage.getConversations();
      setAllSessions(updatedStorage.sessions);
    } catch (error) {
      console.error('Error creating blurting session:', error);
    }
  };

  // Blurting functions
  const submitBlurt = async (content: string, topic?: string) => {
    try {
      // Add user's blurt message to conversation first
      const userBlurtMessage = {
        speaker: 'user' as const,
        text: `[Blurt about ${topic || 'topic'}]: ${content}`,
        timestamp: new Date().toLocaleTimeString(),
        messageId: `msg_${Date.now()}_${Math.random()}`
      };
      
      // Use conversation service to add user message
      conversationService.addMessage(userBlurtMessage);
      
      const response = await fetch('/api/blurt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blurtContent: content, topic })
      });
      
      if (!response.ok) throw new Error('Failed to analyze blurt');
      
      const { feedback } = await response.json();
      setBlurtFeedback(feedback);
      setIsBlurtCompleted(true);
      console.log('Blurt submitted - setting isBlurtCompleted to true');
      
      // Update the session in the database with blurting state
      if (activeSession) {
        await supabaseConversationStorage.updateSession(activeSession.id, {
          blurtContent: content,
          blurtFeedback: feedback,
          isBlurtCompleted: true
        });
      }
      
      // Add feedback message to conversation using conversation service
      const feedbackMessage = {
        speaker: 'ai' as const,
        text: `Great job on your blurt! Here's my analysis:\n\nWhat you know well:\n${feedback.knowledgeStrengths.join('\n')}\n\nAreas to improve:\n${feedback.knowledgeGaps.join('\n')}\n\nSuggestions:\n${feedback.suggestions.join('\n')}\n\n${feedback.encouragement}\n\nLet's continue learning together! What would you like to focus on first?`,
        timestamp: new Date().toLocaleTimeString(),
        messageId: `msg_${Date.now()}_${Math.random()}`
      };
      
      // Use conversation service to add message (this will trigger proper formatting and saving)
      conversationService.addMessage(feedbackMessage);
    } catch (error) {
      console.error('Error submitting blurt:', error);
    }
  };

  const startBlurtMode = () => {
    setLearningMode('blurting');
    setBlurtContent('');
    setBlurtFeedback(null);
    setIsBlurtCompleted(false);
  };

  // Create a dedicated teaching session (bypasses voice session logic)
  const createTeachingSession = async () => {
    if (!user) {
      return;
    }
    
    try {
      // Create new session with teaching mode (no voice session interference)
      const newSession = await supabaseConversationStorage.createSession(undefined, 'teaching');
      
      console.log('Created teaching session:', newSession);
      console.log('Session learning mode:', newSession.learningMode);
      
      setActiveSession(newSession);
      setMessages([]);
      setQuizSummary(null);
      setQuizQuestions([]);
      setQuizAnswers({});
      setQuizEvaluations({});
      setQuizShowAnswers(false);
      
      // Reset teaching state
      setTeachingContent('');
      setTeachingFeedback(null);
      setIsTeachingCompleted(false);
      
      // Update sessions list to show new session in sidebar
      const updatedStorage = await supabaseConversationStorage.getConversations();
      setAllSessions(updatedStorage.sessions);
      
      // Start the teaching conversation with AI's opening message
      const openingMessage = {
        speaker: 'ai' as const,
        text: "Alright, I'm ready to learn! Teach me whatever concept you're trying to understand, and I'll help you deepen your knowledge through our conversation.\n\nTo get started, tell me what you want to teach me. For example, you could say \"I want to teach you about photosynthesis\" or \"Let me explain how computers work\" or \"I'm going to teach you about World War II.\"\n\nThen, start explaining the concept as if I'm a curious student. I'll ask questions, point out gaps, and help you think more deeply about what you're teaching!",
        timestamp: new Date().toLocaleTimeString(),
        messageId: `msg_${Date.now()}_${Math.random()}`
      };
      
      conversationService.addMessage(openingMessage);
    } catch (error) {
      console.error('Error creating teaching session:', error);
    }
  };

  // Teaching functions
  const submitTeaching = async (content: string, topic?: string) => {
    try {
      // Add user's teaching message to conversation first
      const userTeachingMessage = {
        speaker: 'user' as const,
        text: content,
        timestamp: new Date().toLocaleTimeString(),
        messageId: `msg_${Date.now()}_${Math.random()}`
      };
      
      // Use conversation service to add user message
      conversationService.addMessage(userTeachingMessage);
      
      const response = await fetch('/api/teach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: content, 
          topic,
          conversationHistory: messages.slice(-10), // Send last 10 messages for context
          isFirstMessage: messages.length === 1
        })
      });
      
      if (!response.ok) throw new Error('Failed to get teaching response');
      
      const { response: aiResponse } = await response.json();
      
      // Add AI response to conversation
      const aiMessage = {
        speaker: 'ai' as const,
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString(),
        messageId: `msg_${Date.now()}_${Math.random()}`
      };
      
      // Use conversation service to add message (this will trigger proper formatting and saving)
      conversationService.addMessage(aiMessage);
    } catch (error) {
      console.error('Error in teaching conversation:', error);
    }
  };

  const startTeachingMode = () => {
    setLearningMode('teaching');
    setTeachingContent('');
    setTeachingFeedback(null);
    setIsTeachingCompleted(false);
  };

  // Helper function to get typewriter speed in milliseconds
  const getTypewriterSpeedMs = (speed: 'slow' | 'regular' | 'fast'): number => {
    switch (speed) {
      case 'slow': return 80;
      case 'regular': return 50;
      case 'fast': return 25;
      default: return 50;
    }
  };

  // Subscription management functions
  const checkFeatureAccess = async (feature: string): Promise<boolean> => {
    try {
      const usageInfo = await SubscriptionService.checkFeatureLimit(feature);
      return usageInfo.allowed;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  };

  const incrementFeatureUsage = async (feature: string): Promise<void> => {
    try {
      await SubscriptionService.incrementUsage(feature);
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  };

  const loadUserPlan = async () => {
    try {
      const plan = await SubscriptionService.getUserPlan();
      const limits = await SubscriptionService.getPlanLimits(plan);
      setUserPlan(plan);
      setPlanLimits(limits);
      
      // Also check current daily usage
      await checkDailyQuizUsage();
    } catch (error) {
      console.error('Error loading user plan:', error);
    }
  };

  const checkDailyQuizUsage = async () => {
    if (!user?.id) return;
    
    try {
      console.log('Checking daily quiz usage for user:', user.id);
      const response = await fetch('/api/subscription/check-limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: 'quiz_generations',
          userId: user.id
        })
      });
      
      console.log('Daily usage check response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Daily usage check response data:', data);
        setDailyQuizUsage({
          current: data.currentUsage || 0,
          max: data.maxUsage || 3
        });
      } else {
        console.error('Failed to check daily usage:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error checking daily quiz usage:', error);
    }
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
    
    // Learning mode state
    learningMode,
    setLearningMode,
    
    // New chat state
    wantsNewChat,
    setWantsNewChat,
    
    // Blurting state
    blurtContent,
    setBlurtContent,
    blurtFeedback,
    setBlurtFeedback,
    isBlurtCompleted,
    setIsBlurtCompleted,
    
    // Blurting actions
    submitBlurt,
    startBlurtMode,
    createBlurtingSession,
    
    // Teaching state
    teachingContent,
    setTeachingContent,
    teachingFeedback,
    setTeachingFeedback,
    isTeachingCompleted,
    setIsTeachingCompleted,
    
    // Teaching actions
    submitTeaching,
    startTeachingMode,
    createTeachingSession,
    
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
    dailyQuizUsage,
    
    // UI state
    activePanel,
    setActivePanel,
    highlightTerm,
    setHighlightTerm,
    
    // Settings
    streamingEnabled,
    setStreamingEnabled,
    typewriterSpeed,
    setTypewriterSpeed,
    
    // Subscription management
    userPlan,
    planLimits,
    checkFeatureAccess,
    incrementFeatureUsage,
    loadUserPlan,
    
    // App initialization
    isInitialized,
  };

  return (
    <AppContext.Provider value={value}>
      <VapiConversation
        onMessage={(message) => conversationService.addMessage(message)}
        onStateChange={(state) => conversationService.updateState(state)}
        onStart={() => {}}
        onStop={() => {}}
        onGenerateTitle={generateConversationTitleFromTranscript}
        onTranscriptComplete={undefined}
      />
      {children}
    </AppContext.Provider>
  );
}; 