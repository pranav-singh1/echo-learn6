import React, { useCallback, useState, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';

export interface ConversationMessage {
  speaker: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
}

interface ElevenLabsConversationProps {
  onMessage: (message: ConversationMessage) => void;
  onStateChange: (state: { isConnected: boolean; isListening: boolean; error: string | null }) => void;
  onStart: () => void;
  onStop: () => void;
}

export const ElevenLabsConversation: React.FC<ElevenLabsConversationProps> = ({
  onMessage,
  onStateChange,
  onStart,
  onStop
}) => {
  const [log, setLog] = useState<string[]>([]);

  // Use the same ElevenLabs hook as your backend
  const conversation = useConversation({
    onConnect: () => {
      setLog((prev) => [...prev, '[Connected]']);
      onStateChange({ isConnected: true, isListening: true, error: null });
    },
    onDisconnect: () => {
      setLog((prev) => [...prev, '[Disconnected]']);
      onStateChange({ isConnected: false, isListening: false, error: null });
    },
    onMessage: (message) => {
      let speaker: string;
      let text: string;
    
      // message has shape: { message: string; source: 'user' | 'agent' | ... }
      if (typeof message === 'object' && 'message' in message) {
        text = message.message;
        speaker = message.source === 'user' ? 'user' : 'ai';
      } else if (typeof message === 'string') {
        // fallback case
        text = message;
        speaker = 'ai';
      } else {
        text = '[Unknown message format]';
        speaker = 'system';
      }
    
      setLog((prev) => [...prev, `${speaker}: ${text}`]);
      
      // Convert to our message format and notify parent
      const conversationMessage: ConversationMessage = {
        speaker: speaker as 'user' | 'ai' | 'system',
        text,
        timestamp: new Date().toLocaleTimeString()
      };
      
      onMessage(conversationMessage);
      console.log(`[${speaker}]`, text);
    },
    onError: (error) => {
      setLog((prev) => [...prev, `[Error] ${error}`]);
      onStateChange({ isConnected: false, isListening: false, error: error.toString() });
      console.error('Error:', error);
    },
  });

  const startConversation = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: 'agent_01jw58pna0f8tv6khmvbtsxwm9', // Same as backend
      });
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
    await conversation.endSession();
    onStop();
  }, [conversation, onStop]);

  // Expose start/stop methods to parent
  useEffect(() => {
    // Store the methods globally so they can be called from the service
    (window as any).elevenLabsConversation = {
      start: startConversation,
      stop: stopConversation,
      status: conversation.status
    };
  }, [startConversation, stopConversation, conversation.status]);

  // This component doesn't render anything visible
  // It just manages the ElevenLabs conversation
  return null;
}; 