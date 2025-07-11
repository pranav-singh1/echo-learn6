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
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [shouldReconnect, setShouldReconnect] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [originalStream, setOriginalStream] = useState<MediaStream | null>(null);

  // ElevenLabs hook configuration with streaming support
  const conversation = useConversation({
    onConnect: () => {
      setLog((prev) => [...prev, '[Connected]']);
      onStateChange({ isConnected: true, isListening: true, error: null });
      setShouldReconnect(false);
    },
    onDisconnect: () => {
      setLog((prev) => [...prev, '[Disconnected]']);
      
      // Check if this is due to tab switching
      if (!isTabVisible || shouldReconnect) {
        const conversationService = (window as any).conversationService;
        if (conversationService && conversationService.handleAutomaticDisconnection) {
          conversationService.handleAutomaticDisconnection();
        } else {
          onStateChange({ isConnected: false, isListening: false, error: null });
        }
      } else {
        onStateChange({ isConnected: false, isListening: false, error: null });
      }
    },
    onMessage: (message) => {
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

      // Simple message handling - no complex streaming
      const conversationMessage: ConversationMessage = {
        speaker: speaker as 'user' | 'ai' | 'system',
        text,
        timestamp: new Date().toLocaleTimeString(),
        messageId: `msg_${Date.now()}_${Math.random()}`
      };
      
      onMessage(conversationMessage);
    },
    onError: (error) => {
      setLog((prev) => [...prev, `[Error] ${error}`]);
      onStateChange({ isConnected: false, isListening: false, error: error.toString() });
    }
  });

  const startConversation = useCallback(async () => {
    try {
      // Store original getUserMedia
      const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      
      // Override getUserMedia to intercept the stream
      navigator.mediaDevices.getUserMedia = async (constraints) => {
        const stream = await originalGetUserMedia(constraints);
        if (constraints?.audio) {
          setOriginalStream(stream);
        }
        return stream;
      };
      
      // Start ElevenLabs session (it will call getUserMedia internally)
      await conversation.startSession({
        agentId: 'agent_01jw58pna0f8tv6khmvbtsxwm9'
      });
      
      // Restore original getUserMedia
      navigator.mediaDevices.getUserMedia = originalGetUserMedia;
      
      onStart();
      
    } catch (error: any) {
      onStateChange({ 
        isConnected: false, 
        isListening: false, 
        error: error.message || 'Failed to start conversation' 
      });
    }
  }, [conversation, onStart, onStateChange]);

  const stopConversation = useCallback(async () => {
    try {
      await conversation.endSession();
      
      // Clean up original stream
      if (originalStream) {
        originalStream.getTracks().forEach(track => track.stop());
        setOriginalStream(null);
      }
      setIsMuted(false);
      
      onStop();
    } catch (error) {
      // Handle error silently
    }
  }, [conversation, onStop, originalStream]);

  const toggleMute = useCallback(async (muted: boolean) => {
    try {
      setIsMuted(muted);
      
      // Directly control the microphone tracks
      if (originalStream) {
        const audioTracks = originalStream.getAudioTracks();
        audioTracks.forEach(track => {
          track.enabled = !muted;
        });
      }
    } catch (error) {
      // Handle error silently
    }
  }, [originalStream]);

  // Expose start/stop/mute methods
  useEffect(() => {
    (window as any).elevenLabsConversation = {
      start: startConversation,
      stop: stopConversation,
      toggleMute: toggleMute,
      status: conversation.status,
      isMuted: isMuted
    };
    
    return () => {
      if ((window as any).elevenLabsConversation) {
        delete (window as any).elevenLabsConversation;
      }
    };
  }, [startConversation, stopConversation, toggleMute, conversation.status, isMuted]);

  // Handle tab visibility changes to prevent disconnection
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsTabVisible(isVisible);
      
      if (isVisible && shouldReconnect) {
        setShouldReconnect(false);
        
        // Try to resume audio context if it was suspended
        if (typeof window !== 'undefined' && window.AudioContext) {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          if (audioContext.state === 'suspended') {
            audioContext.resume().catch(() => {
              // Handle error silently
            });
          }
        }
      } else if (!isVisible && conversation.status === 'connected') {
        setShouldReconnect(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also handle focus/blur events for additional reliability
    const handleFocus = () => {
      if (shouldReconnect) {
        setShouldReconnect(false);
      }
    };
    
    const handleBlur = () => {
      if (conversation.status === 'connected') {
        setShouldReconnect(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [conversation.status, shouldReconnect]);

  return null;
}; 