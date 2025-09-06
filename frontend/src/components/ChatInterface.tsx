import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { SubscriptionService } from '../lib/subscription';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Mic, MicOff, Send, MessageCircle, AlertCircle, Plus, Edit2, Check, X, LogOut, User, Target, BookOpen, Settings, Download, Trash2, VolumeX, Sparkles, Brain, GraduationCap, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Separator } from './ui/separator';
import MathRenderer from './MathRenderer';
import { TypewriterText } from './TypewriterText';
import { LearningModeSelector } from './LearningModeSelector';
import { BlurtingInterface } from './BlurtingInterface';
import { TeachingInterface } from './TeachingInterface';

export const ChatInterface: React.FC<{ typewriterSpeed?: 'slow' | 'regular' | 'fast' }> = ({ typewriterSpeed = 'regular' }) => {
  const {
    isConnected,
    isListening,
    conversationError,
    messages,
    activeSession,
    createNewSession,
    updateSessionTitle,
    startConversation,
    stopConversation,
    sendTextMessage,
    generateQuiz,
    toggleQuiz,
    toggleMute,
    isGeneratingQuiz,
    quizQuestions,
    activePanel,
    highlightTerm,
    allSessions,
    isMuted,
    quizBlocked,
    dailyQuizUsage,
    // Limit state
    messageUsage,
    voiceUsage,
    isMessageLimitReached,
    isVoiceLimitReached,
    refreshUsageLimits,
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
    submitTeaching,
    startTeachingMode,
    createTeachingSession,
    // Settings
    streamingEnabled,
    setStreamingEnabled
  } = useAppContext();

  const { user, signOut, updateProfile } = useAuth();

  const [textInput, setTextInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [profileName, setProfileName] = useState(user?.user_metadata?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePicture, setProfilePicture] = useState(user?.user_metadata?.profile_picture || '');
  const [isStartingVoice, setIsStartingVoice] = useState(false);
  
  // Usage limits state
  const [usageData, setUsageData] = useState<{
    voice: { current: number; max: number } | null;
    messages: { current: number; max: number } | null;
    quizzes: { current: number; max: number } | null;
  }>({
    voice: null,
    messages: null,
    quizzes: null
  });
  const [loadingUsage, setLoadingUsage] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clear loading state when voice connects
  useEffect(() => {
    if (isConnected) {
      setIsStartingVoice(false);
    }
  }, [isConnected]);

  // Update profile fields when user data changes
  useEffect(() => {
    if (user) {
      setProfileName(user.user_metadata?.name || '');
      setProfileEmail(user.email || '');
      setProfilePicture(user.user_metadata?.profile_picture || '');
    }
  }, [user]);

  // Load usage data when profile modal opens
  useEffect(() => {
    if (showProfileModal && user?.id) {
      loadUsageData();
    }
  }, [showProfileModal, user?.id]);

  // Handle ESC key to close profile modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showProfileModal) {
          setShowProfileModal(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showProfileModal]);

  // Show mode selector when user wants a new chat and no active session
  useEffect(() => {
    if (wantsNewChat && !activeSession && !showModeSelector) {
      setShowModeSelector(true);
    } else if (activeSession) {
      // If we have an active session, hide the mode selector
      setShowModeSelector(false);
    }
  }, [wantsNewChat, activeSession, showModeSelector]);

  // Mode selection handler
  const handleModeSelection = async (mode: 'conversation' | 'blurting' | 'teaching') => {
    setLearningMode(mode);
    setShowModeSelector(false);
    
    if (mode === 'conversation') {
      await createNewSession();
    } else if (mode === 'blurting') {
      await createBlurtingSession();
    } else if (mode === 'teaching') {
      await createTeachingSession();
    }
  };

  const handleSendMessage = async () => {
    if (!textInput.trim()) return;
    
    // Check message limits before sending
    if (isMessageLimitReached) {
      return; // UI should already be blocked, but prevent any attempts
    }
    
    setIsTyping(true);
    try {
      await sendTextMessage(textInput);
      setTextInput('');
      // Refresh usage limits after sending message
      await refreshUsageLimits();
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceToggle = async () => {
    if (isConnected) {
      await stopConversation();
    } else {
      // Check voice limits before starting
      if (isVoiceLimitReached) {
        return; // UI should already be blocked, but prevent any attempts
      }
      
      setIsStartingVoice(true);
      try {
        await startConversation();
        // Refresh usage limits after starting voice conversation
        await refreshUsageLimits();
      } catch (error) {
        console.error('Error starting conversation:', error);
        setIsStartingVoice(false);
      }
    }
  };

  const handleStartEditTitle = () => {
    if (activeSession) {
      setIsEditingTitle(true);
      setEditTitle(activeSession.title);
    }
  };

  const handleSaveTitle = async () => {
    if (activeSession && editTitle.trim()) {
      await updateSessionTitle(activeSession.id, editTitle.trim());
      setIsEditingTitle(false);
      setEditTitle('');
    }
  };

  const handleCancelTitle = () => {
    setIsEditingTitle(false);
    setEditTitle('');
  };

  const handleTitleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      await handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelTitle();
    }
  };

  const getSpeakerColor = (speaker: string) => {
    const sessionLearningMode = activeSession?.learningMode;
    switch (speaker) {
      case 'user':
        return sessionLearningMode === 'blurting'
          ? 'text-purple-700 bg-purple-100 border-purple-300'
          : sessionLearningMode === 'teaching'
          ? 'text-green-700 bg-green-100 border-green-300'
          : 'text-blue-700 bg-blue-50 border-blue-200';
      case 'ai':
        return sessionLearningMode === 'blurting'
          ? 'text-purple-700 bg-purple-100 border-purple-300'
          : sessionLearningMode === 'teaching'
          ? 'text-green-700 bg-green-100 border-green-300'
          : 'text-brand bg-brand-lite border-brand/20';
      case 'system':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSpeakerIcon = (speaker: string) => {
    const sessionLearningMode = activeSession?.learningMode;
    switch (speaker) {
      case 'user':
        if (profilePicture) {
          return (
            <div className="w-6 h-6 rounded-full overflow-hidden border border-blue-200">
              <img 
                src={profilePicture} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
          );
        }
        return (
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <User className="w-3 h-3 text-white" />
          </div>
        );
      case 'ai':
        return (
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            sessionLearningMode === 'blurting'
              ? 'bg-gradient-to-br from-purple-500 to-purple-700'
              : sessionLearningMode === 'teaching'
              ? 'bg-gradient-to-br from-green-500 to-green-700'
              : 'bg-gradient-to-br from-blue-500 to-blue-600'
          }`}>
            {sessionLearningMode === 'blurting' ? (
              <Brain className="w-3 h-3 text-white" />
            ) : sessionLearningMode === 'teaching' ? (
              <GraduationCap className="w-3 h-3 text-white" />
            ) : (
              <MessageCircle className="w-3 h-3 text-white" />
            )}
          </div>
        );
      case 'system':
        return (
          <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
            <Settings className="w-3 h-3 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
            <MessageCircle className="w-3 h-3 text-white" />
          </div>
        );
    }
  };

  // Helper to highlight search term in message text
  function highlightText(text: string, term: string) {
    if (!term) return text;
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.split(regex).map((part, i) =>
      regex.test(part)
        ? <span key={i} className="bg-yellow-200 text-yellow-900 rounded px-1 py-0.5 font-semibold">{part}</span>
        : part
    );
  }

  const connectionStatus = {
    color: isConnected ? 'bg-green-500' : 'bg-gray-400',
    icon: isConnected ? '✅' : '❌',
    label: isConnected ? 'Connected' : 'Disconnected'
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({ 
        name: profileName,
        profilePicture: profilePicture 
      });
      setShowProfileModal(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleProfilePictureUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setProfilePicture(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture('');
  };

  const loadUsageData = async () => {
    if (!user?.id) return;
    
    setLoadingUsage(true);
    try {
      const [voiceUsage, messagesUsage, quizzesUsage] = await Promise.all([
        SubscriptionService.checkFeatureLimit('voice_minutes'),
        SubscriptionService.checkFeatureLimit('messages'),
        SubscriptionService.checkFeatureLimit('quiz_generations')
      ]);

      setUsageData({
        voice: {
          current: voiceUsage.currentUsage,
          max: typeof voiceUsage.maxUsage === 'number' ? voiceUsage.maxUsage : 0
        },
        messages: {
          current: messagesUsage.currentUsage,
          max: typeof messagesUsage.maxUsage === 'number' ? messagesUsage.maxUsage : 0
        },
        quizzes: {
          current: quizzesUsage.currentUsage,
          max: typeof quizzesUsage.maxUsage === 'number' ? quizzesUsage.maxUsage : 0
        }
      });
    } catch (error) {
      console.error('Error loading usage data:', error);
    } finally {
      setLoadingUsage(false);
    }
  };

  const handleExportData = async () => {
    try {
      // Get all user's conversation data from context
      const exportData = {
        exportDate: new Date().toISOString(),
        userEmail: user?.email,
        totalConversations: allSessions.length,
        conversations: allSessions.map(session => ({
          id: session.id,
          title: session.title,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          messageCount: session.messages.length,
          messages: session.messages,
          summary: session.summary,
          quizQuestions: session.quizQuestions,
          quizAnswers: session.quizAnswers,
          quizEvaluations: session.quizEvaluations
        }))
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `echolearn-conversations-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Conversation data exported successfully!');
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleDeleteAllData = async () => {
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

  // Show mode selector when no active session
  if (showModeSelector && !activeSession) {
    return <LearningModeSelector onSelectMode={handleModeSelection} />;
  }

  // Show blurting interface when in blurting mode and blurt is not completed
  console.log('Rendering check - learningMode:', learningMode, 'isBlurtCompleted:', isBlurtCompleted, 'activeSession:', activeSession);
  if (learningMode === 'blurting' && !isBlurtCompleted) {
    console.log('Showing BlurtingInterface');
    return <BlurtingInterface />;
  } else if (learningMode === 'blurting' && isBlurtCompleted) {
    console.log('Showing BlurtingConversation');
  }

  // Show teaching interface when in teaching mode and no active session
  if (learningMode === 'teaching' && !activeSession) {
    console.log('Showing TeachingInterface');
    return <TeachingInterface />;
  }

  // Show blurting conversation interface when in blurting mode and blurt is completed
  const isBlurtingConversation = learningMode === 'blurting' && isBlurtCompleted;
  
  // Determine if this is a blurting conversation (after initial blurt)
  const isBlurtConversation = activeSession?.learningMode === 'blurting' && activeSession && messages.length > 0;
  
  // Determine if this is a teaching conversation
  const isTeachingConversation = activeSession?.learningMode === 'teaching' && activeSession && messages.length > 0;

  // Get background color based on mode
  const getBackgroundColor = () => {
    const sessionLearningMode = activeSession?.learningMode;
    if (sessionLearningMode === 'blurting') {
      // Richer purple tint in dark
      return 'bg-gradient-to-br from-purple-50/50 via-purple-100/30 to-purple-50/50 dark:from-purple-950/60 dark:via-purple-900/40 dark:to-purple-950/60';
    } else if (sessionLearningMode === 'teaching') {
      // Deeper green, better contrast in dark
      return 'bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50 dark:from-emerald-950/60 dark:via-emerald-900/40 dark:to-emerald-950/60';
    } else if (sessionLearningMode === 'conversation') {
      // Calmer blue scheme
      return 'bg-gradient-to-br from-blue-50/50 via-blue-100/30 to-blue-50/50 dark:from-slate-950/60 dark:via-slate-900/40 dark:to-slate-950/60';
    }
    return '';
  };

  // Background tint for the main chat card (header, content)
  const getPanelBackground = () => {
    const sessionLearningMode = activeSession?.learningMode;
    if (sessionLearningMode === 'blurting') return 'bg-white/85 dark:bg-gray-900/85 backdrop-blur-sm border-purple-200/60 dark:border-purple-700/50';
    if (sessionLearningMode === 'teaching') return 'bg-white/85 dark:bg-gray-900/85 backdrop-blur-sm border-emerald-200/60 dark:border-emerald-700/50';
    if (sessionLearningMode === 'conversation') return 'bg-white/85 dark:bg-gray-900/85 backdrop-blur-sm border-sky-200/60 dark:border-sky-700/50';
    return 'bg-background dark:bg-gray-950';
  };

  // Get message styling based on mode
  const getMessageStyling = (isAI: boolean) => {
    const sessionLearningMode = activeSession?.learningMode;
    // Helper palettes
    const userNeutralLight = 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 shadow-slate-100/60';
    const userNeutralDark = 'dark:from-slate-800/50 dark:to-slate-700/40 dark:border-slate-600/50 dark:shadow-slate-900/20';

    if (sessionLearningMode === 'blurting') {
      // AI: purple, User: neutral
      return isAI 
        ? 'bg-gradient-to-br from-purple-100/85 to-purple-200/60 border-purple-300/70 shadow-purple-200/50 dark:from-purple-900/60 dark:to-purple-800/40 dark:border-purple-700/60 dark:shadow-purple-900/30'
        : `bg-gradient-to-br ${userNeutralLight} ${userNeutralDark}`;
    } else if (sessionLearningMode === 'teaching') {
      // AI: emerald, User: neutral
      return isAI 
        ? 'bg-gradient-to-br from-emerald-100/85 to-emerald-200/60 border-emerald-300/70 shadow-emerald-200/50 dark:from-emerald-900/60 dark:to-emerald-800/40 dark:border-emerald-700/60 dark:shadow-emerald-900/30'
        : `bg-gradient-to-br ${userNeutralLight} ${userNeutralDark}`;
    } else if (sessionLearningMode === 'conversation') {
      // AI: blue, User: neutral
      return isAI 
        ? 'bg-gradient-to-br from-sky-100/85 to-sky-200/60 border-sky-300/70 shadow-sky-200/50 dark:from-sky-900/60 dark:to-sky-800/40 dark:border-sky-700/60 dark:shadow-sky-900/30'
        : `bg-gradient-to-br ${userNeutralLight} ${userNeutralDark}`;
    }
    return isAI 
      ? 'bg-muted'
      : `bg-gradient-to-br ${userNeutralLight} ${userNeutralDark}`;
  };

  // Get mode-specific button styling
  const getModeButtonStyle = () => {
    const sessionLearningMode = activeSession?.learningMode;
    if (sessionLearningMode === 'blurting') {
      return 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-purple-600 shadow-lg shadow-purple-500/25';
    } else if (sessionLearningMode === 'teaching') {
      return 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-green-600 shadow-lg shadow-green-500/25';
    } else if (sessionLearningMode === 'conversation') {
      return 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-blue-600 shadow-lg shadow-blue-500/25';
    }
    return 'bg-primary hover:bg-primary/90 text-primary-foreground';
  };

  // Get mode-specific input styling
  const getModeInputStyle = () => {
    const sessionLearningMode = activeSession?.learningMode;
    if (sessionLearningMode === 'blurting') {
      return 'border-purple-300 focus:border-purple-500 focus:ring-purple-500/20 dark:border-purple-600 dark:focus:border-purple-400';
    } else if (sessionLearningMode === 'teaching') {
      return 'border-green-300 focus:border-green-500 focus:ring-green-500/20 dark:border-green-600 dark:focus:border-green-400';
    } else if (sessionLearningMode === 'conversation') {
      return 'border-blue-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-blue-600 dark:focus:border-blue-400';
    }
    return '';
  };

  return (
    <div className={`flex flex-col h-full ${getBackgroundColor()} transition-all duration-300 ease-in-out`}>
      <Card className={`h-full w-full flex flex-col ${getPanelBackground()} text-foreground border-border`}>
        {/* Sticky Header - Session Meta */}
        <CardHeader className={`sticky top-0 z-10 ${getPanelBackground()} border-b border-border p-4 space-y-4`}>
          {/* Top Row: Title + Progress + Status */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${
                isBlurtingConversation 
                  ? 'bg-gradient-to-br from-purple-500 to-purple-700 shadow-purple-500/25' 
                  : isTeachingConversation
                  ? 'bg-gradient-to-br from-green-500 to-green-700 shadow-green-500/25'
                  : 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-500/25'
              }`}>
                {isBlurtingConversation ? (
                  <Brain className="h-4 w-4 text-white" />
                ) : isTeachingConversation ? (
                  <GraduationCap className="h-4 w-4 text-white" />
                ) : (
                  <MessageCircle className="h-4 w-4 text-white" />
                )}
              </div>
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={handleTitleKeyPress}
                    onBlur={handleSaveTitle}
                    className="text-lg font-semibold h-9 w-64 border-brand/30 focus:border-brand"
                    autoFocus
                  />
                  <Button size="sm" variant="ghost" onClick={handleSaveTitle} className="h-8 w-8 p-0 hover:bg-green-50">
                    <Check className="w-4 h-4 text-green-600" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancelTitle} className="h-8 w-8 p-0 hover:bg-red-50">
                    <X className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <h2
                        className="text-lg font-semibold text-foreground truncate leading-tight cursor-text select-text hover:underline underline-offset-4 decoration-gray-300 dark:decoration-gray-600 transition-colors"
                        onDoubleClick={handleStartEditTitle}
                        title="Double-click to edit title"
                      >
                        {activeSession?.title || 'New Conversation'}
                      </h2>
                      
                      {/* Removed inline edit button to avoid visual clutter; double-click title to edit */}
                      
                      {/* Conversation Mode Badge */}
                      {activeSession?.learningMode === 'conversation' && (
                        <Badge variant="outline" className="text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 shadow-sm shadow-blue-200/50 dark:from-blue-900/40 dark:to-blue-800/30 dark:text-blue-200 dark:border-blue-600 dark:shadow-blue-900/30 transition-all duration-300 ease-in-out">
                          Conversation Mode
                        </Badge>
                      )}
                      
                      {isBlurtingConversation && (
                        <Badge variant="outline" className="text-xs font-medium bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300 shadow-sm shadow-purple-200/50 dark:from-purple-900/40 dark:to-purple-800/30 dark:text-purple-200 dark:border-purple-600 dark:shadow-purple-900/30 transition-all duration-300 ease-in-out">
                          Blurting Mode
                        </Badge>
                      )}
                      {isTeachingConversation && (
                        <Badge variant="outline" className="text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 shadow-sm shadow-green-200/50 dark:from-green-900/40 dark:to-green-800/30 dark:text-green-200 dark:border-green-600 dark:shadow-green-900/30 transition-all duration-300 ease-in-out">
                          Teaching Mode
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status indicators and controls */}
            <div className="flex items-center gap-3">
              {/* Connection Status - only show for conversation mode */}
              {!isBlurtingConversation && !isTeachingConversation && (
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              )}
              
              {/* Usage Limits Display */}
              {(messageUsage || voiceUsage) && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {messageUsage && (
                    <span className={messageUsage.maxUsage !== -1 && messageUsage.currentUsage >= messageUsage.maxUsage ? 'text-red-500 font-medium' : ''}>
                      Messages: {messageUsage.currentUsage}/{messageUsage.maxUsage === -1 ? '∞' : messageUsage.maxUsage}
                    </span>
                  )}
                  {voiceUsage && !isBlurtingConversation && !isTeachingConversation && (
                    <span className={voiceUsage.maxUsage !== 'unlimited' && voiceUsage.currentUsage >= voiceUsage.maxUsage ? 'text-red-500 font-medium' : ''}>
                      Voice: {voiceUsage.currentUsage}/{voiceUsage.maxUsage === 'unlimited' ? '∞' : voiceUsage.maxUsage} min
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Bottom Row: Voice Controls & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Only show voice controls for conversation mode */}
              {!isBlurtingConversation && !isTeachingConversation && (
                <>
                  <Button
                    size="sm"
                    onClick={handleVoiceToggle}
                    disabled={isTyping || isStartingVoice || isVoiceLimitReached}
                    className={`flex items-center gap-2 ${getModeButtonStyle()} ${isVoiceLimitReached ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label={isConnected ? 'Stop voice conversation' : 'Start voice conversation'}
                    data-tour="start-voice"
                    title={isVoiceLimitReached ? "Voice minute limit reached" : (isConnected ? 'Stop voice conversation' : 'Start voice conversation')}
                  >
                    {isStartingVoice ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isConnected ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                    {isStartingVoice ? 'Starting...' : isConnected ? 'Stop' : 'Start'} Voice
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={toggleMute}
                    variant="outline"
                    disabled={!isConnected}
                    className={`flex items-center gap-2 ${
                      !isConnected 
                        ? 'opacity-50 cursor-not-allowed' 
                        : isMuted 
                          ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                    data-tour="mute"
                  >
                    <VolumeX className={`h-4 w-4 ${isMuted ? 'text-red-600' : !isConnected ? 'text-gray-400' : ''}`} />
                    {isMuted ? 'Unmute' : 'Mute'}
                  </Button>
                </>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={quizQuestions.length > 0 ? toggleQuiz : generateQuiz}
                disabled={(function(){
                  const atLimit = !!(dailyQuizUsage && dailyQuizUsage.current >= dailyQuizUsage.max);
                  // If a quiz already exists, allow opening it even at limit
                  return isGeneratingQuiz || messages.length === 0 || (quizQuestions.length === 0 && atLimit);
                })()}
                className={`flex items-center gap-2 disabled:opacity-50 transition-all duration-200 ${getModeButtonStyle()}`}
                aria-label={quizQuestions.length > 0 ? "Open Quiz" : "Generate Quiz"}
                data-tour="quiz"
              >
                {isGeneratingQuiz ? (
                  <>
                    <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4" />
                    {quizQuestions.length > 0 ? 'Open Quiz' : 'Generate Quiz'}
                    {dailyQuizUsage && (
                      <span className="text-xs ml-1">
                        ({dailyQuizUsage.current}/{dailyQuizUsage.max})
                      </span>
                    )}
                  </>
                )}
              </Button>
              

            </div>
          </div>
        </CardHeader>

        <CardContent className={`flex-1 flex flex-col min-h-0 w-full gap-2 ${getPanelBackground()} text-foreground p-2 md:p-3`}>
          {/* Error Alert */}
          {conversationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{conversationError}</AlertDescription>
            </Alert>
          )}

          {/* Mode Selector */}
          {showModeSelector && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              <LearningModeSelector onSelectMode={handleModeSelection} />
            </div>
          )}

          {/* Blurting Interface */}
          {learningMode === 'blurting' && !activeSession && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              <BlurtingInterface />
            </div>
          )}

          {/* Teaching Interface */}
          {learningMode === 'teaching' && !activeSession && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              <TeachingInterface />
            </div>
          )}

          {/* Messages */}
          {activeSession && (
            <div className={`flex-1 min-h-0 overflow-y-auto pr-2 ${getPanelBackground()} text-foreground scrollbar-hide`}>
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                      activeSession?.learningMode === 'blurting' 
                        ? 'bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-500/25' 
                        : activeSession?.learningMode === 'teaching'
                        ? 'bg-gradient-to-br from-green-500 to-green-700 shadow-lg shadow-green-500/25'
                        : 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/25'
                    }`}>
                      {activeSession?.learningMode === 'conversation' && (
                        <MessageCircle className="h-8 w-8 text-white" />
                      )}
                      {activeSession?.learningMode === 'blurting' && (
                        <Brain className="h-8 w-8 text-white" />
                      )}
                      {activeSession?.learningMode === 'teaching' && (
                        <GraduationCap className="h-8 w-8 text-white" />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Ready to learn together</h3>
                    <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                      Start a voice conversation or type a message to begin your AI-powered learning session.
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4" />
                        <span>Voice chat</span>
                      </div>
                      <div className="w-px h-4 bg-border"></div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        <span>Text chat</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    message.speaker === 'system' && message.text === 'Conversation ended' ? (
                      <div key={index} className="flex items-center my-6 w-full">
                        <Separator className="flex-1" />
                        <span className="mx-4 text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border shadow-sm whitespace-nowrap">Conversation Ended</span>
                        <Separator className="flex-1" />
                      </div>
                    ) : (
                      <div
                        key={index}
                        className={`flex gap-3 ${
                          message.speaker === 'user' ? 'justify-end' : 'justify-start'
                        } my-4 animate-fade-in`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl p-4 shadow-sm border transition-all duration-300 ease-in-out relative ${
                            message.speaker === 'user'
                              ? getMessageStyling(false)
                              : message.speaker === 'ai'
                              ? getMessageStyling(true)
                              : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-muted dark:border-border dark:text-muted-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            {getSpeakerIcon(message.speaker)}
                            <Badge variant="outline" className={`text-xs font-medium ${getSpeakerColor(message.speaker)}`}>
                              {message.speaker === 'user' ? 'You' : message.speaker === 'ai' ? 'EchoLearn' : 'System'}
                            </Badge>
                            {message.speaker !== 'system' && (
                              <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                                {message.timestamp}
                              </span>
                            )}
                          </div>
                          <div className={`${message.speaker === 'user' || message.speaker === 'ai' ? 'text-sm leading-relaxed' : 'text-sm'}`}>
                            {message.speaker === 'ai' ? (
                              <TypewriterText
                                text={message.text}
                                enabled={message.shouldTypewriter || false}
                                speed={typewriterSpeed === 'slow' ? 150 : typewriterSpeed === 'fast' ? 15 : 50}
                                onComplete={() => {
                                  // Scroll to bottom when typewriter completes
                                  setTimeout(() => {
                                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                                  }, 100);
                                }}
                              />
                            ) : (
                              <div className="whitespace-pre-wrap">
                                {highlightText(message.text, highlightTerm || '')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Text Input */}
          {activeSession && (
            <div className="flex items-center gap-2 p-2 bg-background border-t border-border">
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isMessageLimitReached ? "Message limit reached - please upgrade to continue" : "Type your message here..."}
                className={`flex-1 ${getModeInputStyle()} ${isMessageLimitReached ? 'opacity-50' : ''}`}
                disabled={isTyping || isTextInputLocked || isMessageLimitReached}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!textInput.trim() || isTyping || isTextInputLocked || isMessageLimitReached}
                size="sm"
                className={`flex items-center gap-2 ${getModeButtonStyle()} ${isMessageLimitReached ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isMessageLimitReached ? "Message limit reached" : "Send message"}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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
              <div className="relative">
                {profilePicture ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-blue-200 group">
                    <img 
                      src={profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                      <button
                        onClick={handleRemoveProfilePicture}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
                        title="Remove profile picture"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center border-2 border-blue-200">
                    <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                <button
                  onClick={handleProfilePictureUpload}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                  title="Upload profile picture"
                >
                  +
                </button>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account information</p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="space-y-4">
              <div>
                <Label htmlFor="profile-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </Label>
                <Input
                  id="profile-name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Enter your name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="profile-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </Label>
                <Input
                  id="profile-email"
                  value={profileEmail}
                  disabled
                  className="mt-1 bg-gray-50 dark:bg-gray-800"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
              </div>
              
              <div className="pt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Member since: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>

            {/* Usage Limits Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Usage Limits
                </h3>
                <button
                  onClick={loadUsageData}
                  disabled={loadingUsage}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingUsage ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              
              {loadingUsage ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Loading usage data...
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Voice Minutes */}
                  {usageData.voice && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Voice Minutes (Monthly)
                      </span>
                      <span className={`text-sm font-medium ${
                        usageData.voice.current >= usageData.voice.max 
                          ? 'text-red-500' 
                          : usageData.voice.current >= usageData.voice.max * 0.8 
                            ? 'text-yellow-500' 
                            : 'text-green-500'
                      }`}>
                        {usageData.voice.current}/{usageData.voice.max}
                      </span>
                    </div>
                  )}
                  
                  {/* Messages */}
                  {usageData.messages && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Chat Messages (Monthly)
                      </span>
                      <span className={`text-sm font-medium ${
                        usageData.messages.current >= usageData.messages.max 
                          ? 'text-red-500' 
                          : usageData.messages.current >= usageData.messages.max * 0.8 
                            ? 'text-yellow-500' 
                            : 'text-green-500'
                      }`}>
                        {usageData.messages.current}/{usageData.messages.max}
                      </span>
                    </div>
                  )}
                  
                  {/* Quizzes */}
                  {usageData.quizzes && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Quiz Generations (Daily)
                      </span>
                      <span className={`text-sm font-medium ${
                        usageData.quizzes.current >= usageData.quizzes.max 
                          ? 'text-red-500' 
                          : usageData.quizzes.current >= usageData.quizzes.max * 0.8 
                            ? 'text-yellow-500' 
                            : 'text-green-500'
                      }`}>
                        {usageData.quizzes.current}/{usageData.quizzes.max}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleSaveProfile}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Changes
              </Button>
              <Button
                onClick={() => setShowProfileModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
