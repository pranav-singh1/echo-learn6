import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Mic, MicOff, Send, MessageCircle, AlertCircle, Plus, Edit2, Check, X, LogOut, User, Target, BookOpen, Settings, Download, Trash2, VolumeX } from 'lucide-react';
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
    hasSentFirstTextAfterVoice
  } = useAppContext();

  const { user, signOut, updateProfile } = useAuth();

  const [textInput, setTextInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [profileName, setProfileName] = useState(user?.user_metadata?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update profile fields when user data changes
  useEffect(() => {
    if (user) {
      setProfileName(user.user_metadata?.name || '');
      setProfileEmail(user.email || '');
    }
  }, [user]);

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
    switch (speaker) {
      case 'user':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'ai':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'system':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSpeakerIcon = (speaker: string) => {
    switch (speaker) {
      case 'user':
        return '👤';
      case 'ai':
        return '🤖';
      case 'system':
        return '⚙️';
      default:
        return '💬';
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
      await updateProfile({ name: profileName });
      setShowProfileModal(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
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

  return (
    <>
      <Card className="h-full w-full flex flex-col bg-background text-foreground border-border">
        {/* Sticky Header - Session Meta */}
        <CardHeader className="bg-gradient-to-r from-background to-background/80 backdrop-blur-sm border-b border-border shadow-lg sticky top-0 z-20 p-3 space-y-3">
          {/* Top Row: Title + Progress + Status */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <MessageCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={handleTitleKeyPress}
                    onBlur={handleSaveTitle}
                    className="text-lg font-semibold h-8 w-48 border-blue-300 focus:border-blue-500"
                    autoFocus
                  />
                  <Button size="sm" variant="ghost" onClick={handleSaveTitle} className="h-6 w-6 p-0">
                    <Check className="w-3 h-3 text-green-600" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancelTitle} className="h-6 w-6 p-0">
                    <X className="w-3 h-3 text-red-600" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group min-w-0">
                  <span 
                    className="text-lg font-semibold cursor-pointer hover:text-blue-600 transition-colors truncate"
                    onDoubleClick={handleStartEditTitle}
                    title={activeSession?.title || 'New Conversation'}
                  >
                    {activeSession?.title || 'New Conversation'}
                  </span>
                  {activeSession && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleStartEditTitle}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Voice Session Status */}
              {isVoiceSessionActive && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-full px-3 py-1.5 border border-red-200 dark:border-red-800">
                  <Mic className="w-4 h-4 text-red-600 animate-pulse" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300 whitespace-nowrap">
                    Voice Session Active
                  </span>
                </div>
              )}

              {/* Connection Status Badge */}
              <Badge 
                variant="outline" 
                className={`${connectionStatus.color.replace('bg-', 'border-').replace('500', '300')} ${connectionStatus.color.replace('bg-', 'text-').replace('500', '700')} flex items-center gap-1.5 px-2.5 py-1`}
              >
                <span className="text-xs">{connectionStatus.icon}</span>
                <span className="text-xs font-medium">{connectionStatus.label}</span>
              </Badge>
            </div>
          </div>

          {/* Bottom Row: Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 pr-4 border-r border-border dark:border-border/60">
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
                        ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100' 
                        : 'hover:bg-gray-50'
                  }`}
                  aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                  data-tour="mute"
                >
                  <VolumeX className={`h-4 w-4 ${isMuted ? 'text-red-600' : !isConnected ? 'text-gray-400' : ''}`} />
                  {isMuted ? 'Unmute' : 'Mute'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleQuiz}
                  disabled={isGeneratingQuiz || messages.length < 3}
                  className="flex items-center gap-2 disabled:opacity-50"
                  aria-label={activePanel === 'quiz' ? 'Close Quiz' : quizQuestions.length > 0 ? 'Open Quiz' : 'Generate Quiz'}
                  data-tour="quiz"
                >
                  <BookOpen className="h-4 w-4" />
                  {isGeneratingQuiz ? 'Generating...' : 
                   activePanel === 'quiz' ? 'Close Quiz' :
                   quizQuestions.length > 0 ? 'Open Quiz' : 'Generate Quiz'}
                </Button>
              </div>
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

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-2 bg-background text-foreground scrollbar-hide">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-6">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation to begin learning!</p>
                  <p className="text-sm mt-2">Use voice or text to interact with EchoLearn.</p>
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
                        className={`max-w-[80%] rounded-2xl p-4 shadow-sm border transition-all duration-200 relative ${
                          message.speaker === 'user'
                            ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold border-l-4 border-blue-600 dark:bg-blue-900 dark:border-blue-400 dark:text-blue-100'
                            : message.speaker === 'ai'
                            ? 'bg-white border-indigo-300 text-gray-900 shadow-md border-l-4 border-indigo-500 dark:bg-card dark:border-indigo-500 dark:text-card-foreground'
                            : 'bg-gray-100 border-gray-200 text-gray-600 dark:bg-muted dark:border-border dark:text-muted-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">{getSpeakerIcon(message.speaker)}</span>
                          <Badge variant="outline" className={`text-xs ${getSpeakerColor(message.speaker)}`}>
                            {message.speaker === 'user' ? 'You' : message.speaker === 'ai' ? 'EchoLearn' : 'System'}
                          </Badge>
                        </div>
                        <p className={`mb-2 ${message.speaker === 'user' || message.speaker === 'ai' ? 'text-sm font-normal leading-relaxed' : 'text-sm'}`}>{highlightText(message.text, highlightTerm)}</p>
                        {message.speaker !== 'system' && (
                          <span className="block text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">
                            {message.timestamp}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                ))
              )}
              {isTyping && (
                <div className="flex gap-3 justify-start my-2">
                  <div className="max-w-[80%] rounded-2xl p-4 shadow-sm border transition-all duration-200 bg-white border-indigo-300 text-gray-900 shadow-md border-l-4 border-indigo-500 dark:bg-card dark:border-indigo-500 dark:text-card-foreground flex items-center gap-2"
                    role="status" aria-live="polite"
                  >
                    <span className="text-sm">🤖</span>
                    <span className="text-sm font-medium">EchoLearn is typing</span>
                    <span className="ml-2 flex space-x-1">
                      <span className="inline-block w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="inline-block w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></span>
                      <span className="inline-block w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="flex gap-2 pt-2 border-t border-border bg-background">
            <div className="flex-1 relative">
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isTextInputLocked 
                    ? "Text input locked during voice session..." 
                    : "Type your message..."
                }
                disabled={isTyping || isTextInputLocked}
                className={`flex-1 ${isTextInputLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                aria-label="Type your message"
              />
              {isTextInputLocked && (
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span>Voice Active</span>
                  </div>
                </div>
              )}
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!textInput.trim() || isTyping || isTextInputLocked}
              size="sm"
              aria-label="Send message"
              className={isTextInputLocked ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Voice Session Info */}
          {isTextInputLocked && (
            <div className="px-2 py-1 bg-blue-50 border-l-4 border-blue-400 rounded-r">
              <p className="text-xs text-blue-700">
                💡 <strong>Voice Session Active:</strong> Text input is locked. Click "Stop Voice" to enable text chat. 
                Your first text message will include the voice session transcript for context.
              </p>
            </div>
          )}
          
          {/* Transcript Ready Info */}
          {!isTextInputLocked && voiceSessionTranscript && !hasSentFirstTextAfterVoice && (
            <div className="px-2 py-1 bg-green-50 border-l-4 border-green-400 rounded-r">
              <p className="text-xs text-green-700">
                ✅ <strong>Voice Session Ended:</strong> Text input unlocked. Your first message will include the voice session transcript.
              </p>
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
    </>
  );
};
