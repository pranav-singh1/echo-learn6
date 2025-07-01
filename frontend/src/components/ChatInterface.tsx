import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Mic, MicOff, Send, MessageCircle, AlertCircle, Plus, Edit2, Check, X, LogOut, User } from 'lucide-react';
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

  return (
    <Card className="h-full w-full flex flex-col bg-background text-foreground border-border">
      <CardHeader className="flex flex-col gap-1 bg-background text-foreground border-b border-border shadow-sm dark:shadow dark:bg-background/80 sticky top-0 z-10 p-2 md:p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <MessageCircle className="h-5 w-5" />
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={handleTitleKeyPress}
                    onBlur={handleSaveTitle}
                    className="text-lg font-semibold h-8 w-48"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSaveTitle}
                    className="h-6 w-6 p-0"
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelTitle}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span 
                    className="cursor-pointer hover:text-blue-600 transition-colors"
                    onDoubleClick={handleStartEditTitle}
                  >
                    {activeSession?.title || 'New Conversation'}
                  </span>
                  {activeSession && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleStartEditTitle}
                      className="h-6 w-6 p-0 opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              )}
            </CardTitle>
            {activeSession?.isActive && (
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 pr-4 border-r border-border dark:border-border/60">
              <Button
                variant="outline"
                size="sm"
                onClick={createNewSession}
                className="flex items-center gap-2"
                aria-label="Start a new chat"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
              <Button
                size="sm"
                onClick={handleVoiceToggle}
                disabled={isTyping}
                className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700 border-blue-600"
                aria-label={isConnected ? 'Stop voice conversation' : 'Start voice conversation'}
              >
                {isConnected ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isConnected ? 'Stop' : 'Start'} Voice
              </Button>
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleQuiz}
                  disabled={isGeneratingQuiz}
                  className="flex items-center gap-2"
                  aria-label={activePanel === 'quiz' ? 'Close Quiz' : quizQuestions.length > 0 ? 'Open Quiz' : 'Generate Quiz'}
                >
                  {isGeneratingQuiz ? 'Generating...' : 
                   activePanel === 'quiz' ? 'Close Quiz' :
                   quizQuestions.length > 0 ? 'Open Quiz' : 'Generate Quiz'}
                </Button>
              )}
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
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className={isConnected ? 'text-green-600' : 'text-gray-500'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {isListening && (
            <>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-600">Listening...</span>
            </>
          )}
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
                      <p className={`mb-2 ${message.speaker === 'user' || message.speaker === 'ai' ? 'text-lg md:text-xl font-normal leading-snug' : 'text-sm'}`}>{highlightText(message.text, highlightTerm)}</p>
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
            disabled={!isConnected && !textInput}
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
