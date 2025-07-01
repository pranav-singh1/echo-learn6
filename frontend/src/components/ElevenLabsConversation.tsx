import React, { useCallback, useState, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';

export interface ConversationMessage {
  speaker: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
  messageId?: string;
}

interface ElevenLabsConversationProps {
  onMessage: (message: ConversationMessage) => void;
  onMessageUpdate: (messageId: string, text: string, isComplete: boolean) => void;
  onStateChange: (state: { isConnected: boolean; isListening: boolean; error: string | null }) => void;
  onStart: () => void;
  onStop: () => void;
}

export const ElevenLabsConversation: React.FC<ElevenLabsConversationProps> = ({
  onMessage,
  onMessageUpdate,
  onStateChange,
  onStart,
  onStop
}) => {
  const [log, setLog] = useState<string[]>([]);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<{
    id: string;
    text: string;
    speaker: string;
  } | null>(null);

  // ElevenLabs hook configuration with streaming support
  const conversation = useConversation({
    onConnect: () => {
      console.log('ElevenLabs: Connected');
      setLog((prev) => [...prev, '[Connected]']);
      onStateChange({ isConnected: true, isListening: true, error: null });
    },
    onDisconnect: () => {
      console.log('ElevenLabs: Disconnected');
      setLog((prev) => [...prev, '[Disconnected]']);
      onStateChange({ isConnected: false, isListening: false, error: null });
    },
    onMessage: (message) => {
      console.log('ElevenLabs: Message received:', message);
      let speaker: string;
      let text: string;
    
      if (typeof message === 'object' && 'message' in message) {
        text = message.message;
        speaker = message.source === 'user' ? 'user' : 'ai';
      } else if (typeof message === 'string') {
        text = message;
        speaker = 'ai';
      } else {
        text = '[Unknown message format]';
        speaker = 'system';
      }

      setLog((prev) => [...prev, `${speaker}: ${text}`]);

      // Handle streaming for AI messages
      if (speaker === 'ai') {
        const messageId = `msg_${Date.now()}_${Math.random()}`;
        
        if (!currentStreamingMessage) {
          // Start new streaming message
          const streamingMessage: ConversationMessage = {
            speaker: 'ai',
            text: '',
            timestamp: new Date().toLocaleTimeString(),
            isStreaming: true,
            messageId
          };
          
          setCurrentStreamingMessage({ id: messageId, text: '', speaker });
          onMessage(streamingMessage);
          
          // Start character-by-character streaming
          streamText(text, messageId);
        } else {
          // Continue existing streaming message
          const fullText = currentStreamingMessage.text + ' ' + text;
          setCurrentStreamingMessage(prev => prev ? { ...prev, text: fullText } : null);
          streamText(text, currentStreamingMessage.id, currentStreamingMessage.text);
        }
      } else {
        // For user/system messages, add immediately
        const conversationMessage: ConversationMessage = {
          speaker: speaker as 'user' | 'ai' | 'system',
          text,
          timestamp: new Date().toLocaleTimeString(),
          messageId: `msg_${Date.now()}_${Math.random()}`
        };
        
        onMessage(conversationMessage);
      }
      
      console.log(`[${speaker}]`, text);
    },
    onError: (error) => {
      console.error('ElevenLabs: Error:', error);
      setLog((prev) => [...prev, `[Error] ${error}`]);
      onStateChange({ isConnected: false, isListening: false, error: error.toString() });
      
      // Complete any streaming message on error
      if (currentStreamingMessage) {
        onMessageUpdate(currentStreamingMessage.id, currentStreamingMessage.text, true);
        setCurrentStreamingMessage(null);
      }
    }
  });

  // Function to stream text character by character
  const streamText = useCallback((fullText: string, messageId: string, existingText: string = '') => {
    const textToStream = existingText ? fullText : fullText;
    let currentIndex = existingText.length;
    
    const streamInterval = setInterval(() => {
      if (currentIndex < textToStream.length) {
        const currentText = textToStream.substring(0, currentIndex + 1);
        onMessageUpdate(messageId, currentText, false);
        currentIndex++;
      } else {
        // Streaming complete
        clearInterval(streamInterval);
        onMessageUpdate(messageId, textToStream, true);
        setCurrentStreamingMessage(null);
      }
    }, 30); // Adjust speed - 30ms per character

    // Cleanup function to clear interval if component unmounts
    return () => clearInterval(streamInterval);
  }, [onMessageUpdate]);

  const startConversation = useCallback(async () => {
    try {
      console.log('Starting conversation - requesting mic permission...');
      
      // Simple microphone permission request
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone permission granted');
      
      // Start ElevenLabs session with minimal config
      console.log('Starting ElevenLabs session...');
      await conversation.startSession({
        agentId: 'agent_01jw58pna0f8tv6khmvbtsxwm9'
      });
      
      console.log('ElevenLabs session started successfully');
      onStart();
      
    } catch (error: any) {
      console.error('Failed to start conversation:', error);
      onStateChange({ 
        isConnected: false, 
        isListening: false, 
        error: error.message || 'Failed to start conversation' 
      });
    }
  }, [conversation, onStart, onStateChange]);

  const stopConversation = useCallback(async () => {
    try {
      console.log('Stopping conversation...');
      await conversation.endSession();
      console.log('Conversation stopped');
      
      // Complete any streaming message when stopping
      if (currentStreamingMessage) {
        onMessageUpdate(currentStreamingMessage.id, currentStreamingMessage.text, true);
        setCurrentStreamingMessage(null);
      }
      
      onStop();
    } catch (error) {
      console.error('Error stopping conversation:', error);
    }
  }, [conversation, onStop, currentStreamingMessage, onMessageUpdate]);

  // Expose start/stop methods
  useEffect(() => {
    (window as any).elevenLabsConversation = {
      start: startConversation,
      stop: stopConversation,
      status: conversation.status
    };
    
    return () => {
      if ((window as any).elevenLabsConversation) {
        delete (window as any).elevenLabsConversation;
      }
    };
  }, [startConversation, stopConversation, conversation.status]);

  return null;
}; 