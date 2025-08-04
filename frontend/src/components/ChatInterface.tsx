import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Mic, MicOff, Send, MessageCircle, AlertCircle, Plus, Edit2, Check, X, LogOut, User, Target, BookOpen, Settings, Download, Trash2, VolumeX, Sparkles, Brain, GraduationCap } from 'lucide-react';
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
import { runBlurtingMigration } from '../lib/migration';

export const ChatInterface: React.FC = () => {
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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [profileName, setProfileName] = useState(user?.user_metadata?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePicture, setProfilePicture] = useState(user?.user_metadata?.profile_picture || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update profile fields when user data changes
  useEffect(() => {
    if (user) {
      setProfileName(user.user_metadata?.name || '');
      setProfileEmail(user.email || '');
      setProfilePicture(user.user_metadata?.profile_picture || '');
    }
  }, [user]);

  // Handle ESC key to close profile modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showProfileModal) {
          setShowProfileModal(false);
        }
        if (showSettingsModal) {
          setShowSettingsModal(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showProfileModal, showSettingsModal]);

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
    
    setIsTyping(true);
    await sendTextMessage(textInput);
    setTextInput('');
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
      await startConversation();
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
              : 'bg-gradient-to-br from-brand to-brand-dark'
          }`}>
            {sessionLearningMode === 'blurting' ? (
              <Brain className="w-3 h-3 text-white" />
            ) : sessionLearningMode === 'teaching' ? (
              <GraduationCap className="w-3 h-3 text-white" />
            ) : (
              <Sparkles className="w-3 h-3 text-white" />
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

  const handleRunMigration = async () => {
    try {
      const success = await runBlurtingMigration();
      if (success) {
        alert('Migration completed successfully!');
      } else {
        alert('Migration failed. Check console for details.');
      }
    } catch (error) {
      console.error('Migration error:', error);
      alert('Migration failed. Check console for details.');
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
      return 'bg-purple-50/30'; // Subtle purple tint for blurting
    } else if (sessionLearningMode === 'teaching') {
      return 'bg-green-50/30'; // Subtle green tint for teaching
    }
    return ''; // Default for conversation mode
  };

  // Get message styling based on mode
  const getMessageStyling = (isAI: boolean) => {
    const sessionLearningMode = activeSession?.learningMode;
    if (sessionLearningMode === 'blurting') {
      return isAI 
        ? 'bg-purple-100/50 border-purple-200/70' 
        : 'bg-purple-50/70 border-purple-100/70';
    } else if (sessionLearningMode === 'teaching') {
      return isAI 
        ? 'bg-green-100/50 border-green-200/70' 
        : 'bg-green-50/70 border-green-100/70';
    }
    return isAI 
      ? 'bg-muted' 
      : 'bg-primary text-primary-foreground';
  };

  return (
    <div className={`flex flex-col h-full ${getBackgroundColor()} transition-all duration-300 ease-in-out`}>
      <Card className="h-full w-full flex flex-col bg-background text-foreground border-border">
        {/* Sticky Header - Session Meta */}
        <CardHeader className="sticky top-0 z-10 bg-background border-b border-border p-4 space-y-4">
          {/* Top Row: Title + Progress + Status */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                isBlurtingConversation 
                  ? 'bg-gradient-to-br from-purple-500 to-purple-700' 
                  : isTeachingConversation
                  ? 'bg-gradient-to-br from-green-500 to-green-700'
                  : 'bg-gradient-to-br from-brand to-brand-dark'
              }`}>
                {isBlurtingConversation ? (
                  <Brain className="h-4 w-4 text-white" />
                ) : isTeachingConversation ? (
                  <GraduationCap className="h-4 w-4 text-white" />
                ) : (
                  <Sparkles className="h-4 w-4 text-white" />
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
                      <h2 className="text-lg font-semibold text-foreground truncate leading-tight">
                        {activeSession?.title || 'New Conversation'}
                      </h2>
                      {isBlurtingConversation && (
                        <Badge variant="outline" className="text-xs font-medium bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700 transition-all duration-300 ease-in-out">
                          Blurting Mode
                        </Badge>
                      )}
                      {isTeachingConversation && (
                        <Badge variant="outline" className="text-xs font-medium bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700 transition-all duration-300 ease-in-out">
                          Teaching Mode
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleStartEditTitle}
                    className="h-8 w-8 p-0 opacity-60 hover:opacity-100 hover:bg-gray-100"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Status indicators and controls */}
            <div className="flex items-center gap-3">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                <span className="text-xs font-medium text-muted-foreground">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
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
                    disabled={isTyping}
                    className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700 border-blue-600"
                    aria-label={isConnected ? 'Stop voice conversation' : 'Start voice conversation'}
                    data-tour="start-voice"
                  >
                    {isConnected ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {isConnected ? 'Stop' : 'Start'} Voice
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
                disabled={isGeneratingQuiz || messages.length === 0}
                className="flex items-center gap-2 disabled:opacity-50 hover:bg-brand/5 hover:border-brand/30 hover:text-brand transition-all duration-200 dark:hover:bg-brand/10"
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
                  </>
                )}
              </Button>
              

            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col min-h-0 w-full gap-2 bg-background text-foreground p-2 md:p-3">
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
            <div className="flex-1 min-h-0 overflow-y-auto pr-2 bg-background text-foreground scrollbar-hide">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-brand-lite to-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="h-8 w-8 text-brand" />
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
                              ? activeSession?.learningMode === 'blurting'
                                ? 'bg-purple-100 border-purple-300 text-purple-900 shadow-md dark:bg-purple-900/30 dark:border-purple-400/50 dark:text-purple-100'
                                : activeSession?.learningMode === 'teaching'
                                ? 'bg-green-100 border-green-300 text-green-900 shadow-md dark:bg-green-900/30 dark:border-green-400/50 dark:text-green-100'
                                : 'bg-blue-50 border-blue-200 text-blue-900 shadow-md dark:bg-blue-900/20 dark:border-blue-400/30 dark:text-blue-100'
                              : message.speaker === 'ai'
                              ? activeSession?.learningMode === 'blurting'
                                ? 'bg-white border-purple-300 text-gray-900 shadow-md dark:bg-card dark:border-purple-400 dark:text-card-foreground'
                                : activeSession?.learningMode === 'teaching'
                                ? 'bg-white border-green-300 text-gray-900 shadow-md dark:bg-card dark:border-green-400 dark:text-card-foreground'
                                : 'bg-white border-brand/20 text-gray-900 shadow-md dark:bg-card dark:border-brand/30 dark:text-card-foreground'
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
                                enabled={streamingEnabled && message.shouldTypewriter}
                                speed={30}
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
                placeholder="Type your message here..."
                className="flex-1"
                disabled={isTyping || isTextInputLocked}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!textInput.trim() || isTyping || isTextInputLocked}
                size="sm"
                className="flex items-center gap-2"
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Customize your experience</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Data & Privacy
                </Label>
                <div className="mt-2 space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={handleExportData}>
                    <Download className="mr-2 h-3 w-3" />
                    Export Conversation Data
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs text-red-600 hover:text-red-700" onClick={handleDeleteAllData}>
                    <Trash2 className="mr-2 h-3 w-3" />
                    Delete All Data
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Chat Experience
                </Label>
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Typewriter Effect</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Show AI text character by character as you read</p>
                    </div>
                    <Switch
                      checked={streamingEnabled}
                      onCheckedChange={setStreamingEnabled}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
