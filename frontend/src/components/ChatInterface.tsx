import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Mic, MicOff, Send, MessageCircle, AlertCircle, Plus, Edit2, Check, X, LogOut, User, Target, BookOpen } from 'lucide-react';
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
    isGeneratingQuiz,
    quizQuestions,
    activePanel,
    highlightTerm
  } = useAppContext();

  const { user, signOut } = useAuth();

  const [textInput, setTextInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Calculate learning progress
  const userMessages = messages.filter(msg => msg.speaker === 'user');
  const progressTowardsQuiz = Math.min(userMessages.length, 5);
  const progressPercentage = (progressTowardsQuiz / 5) * 100;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  return (
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
            {/* Progress Chip */}
            {messages.length > 0 && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full px-3 py-1.5 border border-blue-200 dark:border-blue-800">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300 whitespace-nowrap">
                  Learning streak: {progressTowardsQuiz} / 5
                </span>
                <div className="w-8 h-1.5 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
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
          <div className="pl-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2" aria-label="User menu">
                  <User className="h-4 w-4" />
                  {user?.email?.split('@')[0] || 'User'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <User className="mr-2 h-4 w-4" />
                  <span>{user?.email}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          <Input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isTyping}
            className="flex-1"
            aria-label="Type your message"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!textInput.trim() || isTyping}
            size="sm"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
