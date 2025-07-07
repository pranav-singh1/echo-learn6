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
      console.log('ElevenLabs: Connected');
      setLog((prev) => [...prev, '[Connected]']);
      onStateChange({ isConnected: true, isListening: true, error: null });
      setShouldReconnect(false);
    },
    onDisconnect: () => {
      console.log('ElevenLabs: Disconnected');
      setLog((prev) => [...prev, '[Disconnected]']);
      
      // Check if this is due to tab switching
      if (!isTabVisible || shouldReconnect) {
        console.log('Disconnection due to tab switching - using automatic disconnection handler');
        const conversationService = (window as any).conversationService;
        if (conversationService && conversationService.handleAutomaticDisconnection) {
          conversationService.handleAutomaticDisconnection();
        } else {
          onStateChange({ isConnected: false, isListening: false, error: null });
        }
      } else {
        console.log('Unexpected disconnection while tab is visible');
        onStateChange({ isConnected: false, isListening: false, error: null });
      }
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

      // Simple message handling - no complex streaming
      const conversationMessage: ConversationMessage = {
        speaker: speaker as 'user' | 'ai' | 'system',
        text,
        timestamp: new Date().toLocaleTimeString(),
        messageId: `msg_${Date.now()}_${Math.random()}`
      };
      
      onMessage(conversationMessage);
      console.log(`[${speaker}]`, text);
    },
    onError: (error) => {
      console.error('ElevenLabs: Error:', error);
      setLog((prev) => [...prev, `[Error] ${error}`]);
      onStateChange({ isConnected: false, isListening: false, error: error.toString() });
    }
  });

  const startConversation = useCallback(async () => {
    try {
      console.log('Starting conversation - requesting mic permission...');
      
      // Store original getUserMedia
      const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      
      // Override getUserMedia to intercept the stream
      navigator.mediaDevices.getUserMedia = async (constraints) => {
        const stream = await originalGetUserMedia(constraints);
        if (constraints?.audio) {
          console.log('Intercepted audio stream for ElevenLabs');
          setOriginalStream(stream);
        }
        return stream;
      };
      
      // Start ElevenLabs session (it will call getUserMedia internally)
      console.log('Starting ElevenLabs session...');
      await conversation.startSession({
        agentId: 'agent_01jw58pna0f8tv6khmvbtsxwm9'
      });
      
      // Restore original getUserMedia
      navigator.mediaDevices.getUserMedia = originalGetUserMedia;
      
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
      
      // Clean up original stream
      if (originalStream) {
        originalStream.getTracks().forEach(track => track.stop());
        setOriginalStream(null);
      }
      setIsMuted(false);
      
      onStop();
    } catch (error) {
      console.error('Error stopping conversation:', error);
    }
  }, [conversation, onStop, originalStream]);

  const toggleMute = useCallback(async (muted: boolean) => {
    try {
      console.log('Toggling mute:', muted);
      setIsMuted(muted);
      
      // Directly control the microphone tracks
      if (originalStream) {
        const audioTracks = originalStream.getAudioTracks();
        audioTracks.forEach(track => {
          track.enabled = !muted;
          console.log(`Audio track ${track.id} enabled:`, track.enabled);
        });
        console.log('Microphone muted:', muted);
      } else {
        console.warn('No original stream available for muting');
      }
      
      console.log('Mute toggled successfully');
    } catch (error) {
      console.error('Error toggling mute:', error);
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
        console.log('Tab became visible, attempting to reconnect...');
        setShouldReconnect(false);
        
        // Try to resume audio context if it was suspended
        if (typeof window !== 'undefined' && window.AudioContext) {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
              console.log('Audio context resumed');
            }).catch(err => {
              console.warn('Failed to resume audio context:', err);
            });
          }
        }
      } else if (!isVisible && conversation.status === 'connected') {
        console.log('Tab became hidden, marking for potential reconnection');
        setShouldReconnect(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also handle focus/blur events for additional reliability
    const handleFocus = () => {
      if (shouldReconnect) {
        console.log('Window focused, attempting to reconnect...');
        setShouldReconnect(false);
      }
    };
    
    const handleBlur = () => {
      if (conversation.status === 'connected') {
        console.log('Window blurred while connected');
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