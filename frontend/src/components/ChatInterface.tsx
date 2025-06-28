import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Mic, MicOff, Send, MessageCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export const ChatInterface: React.FC = () => {
  const {
    isConnected,
    isListening,
    conversationError,
    messages,
    startConversation,
    stopConversation,
    sendTextMessage,
    generateQuiz,
    isGeneratingQuiz
  } = useAppContext();

  const [textInput, setTextInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversation
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={isConnected ? "destructive" : "default"}
              size="sm"
              onClick={handleVoiceToggle}
              disabled={isTyping}
              className="flex items-center gap-2"
            >
              {isConnected ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isConnected ? 'Stop' : 'Start'} Voice
            </Button>
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={generateQuiz}
                disabled={isGeneratingQuiz}
                className="flex items-center gap-2"
              >
                {isGeneratingQuiz ? 'Generating...' : 'Generate Quiz'}
              </Button>
            )}
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

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Error Alert */}
        {conversationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{conversationError}</AlertDescription>
          </Alert>
        )}

        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation to begin learning!</p>
                <p className="text-sm mt-2">Use voice or text to interact with EchoLearn.</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.speaker === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 border ${
                      message.speaker === 'user'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : message.speaker === 'ai'
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : 'bg-gray-50 border-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{getSpeakerIcon(message.speaker)}</span>
                      <Badge variant="outline" className={`text-xs ${getSpeakerColor(message.speaker)}`}>
                        {message.speaker === 'user' ? 'You' : message.speaker === 'ai' ? 'EchoLearn' : 'System'}
                      </Badge>
                      <span className="text-xs text-gray-500">{message.timestamp}</span>
                    </div>
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span>🤖</span>
                    <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">
                      EchoLearn
                    </Badge>
                    <span className="text-xs text-gray-500">Typing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2 pt-4 border-t">
          <Input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={!isConnected && !textInput}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!textInput.trim() || isTyping}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
