import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RetellWebClient } from 'retell-client-js-sdk';

const agentId = 'agent_302093d9c369a0189b50c7de42';
const retellWebClient = new RetellWebClient();

export interface ConversationMessage {
  speaker: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  messageId: string;
}

interface RetellConversationProps {
  onMessage?: (message: ConversationMessage) => void;
  onStateChange?: (state: { isConnected: boolean; isCalling: boolean; error: string | null }) => void;
  onStart?: () => void;
  onStop?: () => void;
}

export const RetellConversation: React.FC<RetellConversationProps> = ({
  onMessage,
  onStateChange,
  onStart,
  onStop,
}) => {
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    retellWebClient.on('call_started', () => {
      setIsCalling(true);
      setError(null);
      onStateChange?.({ isConnected: true, isCalling: true, error: null });
      onStart?.();
    });
    
    retellWebClient.on('call_ended', () => {
      setIsCalling(false);
      onStateChange?.({ isConnected: false, isCalling: false, error: null });
      onStop?.();
    });
    
    retellWebClient.on('update', (update: any) => {
      console.log('Retell update received:', update);
      if (update.transcript) {
        console.log('Transcript found:', update.transcript);
        const transcriptLines = update.transcript.split('\n');
        console.log('Transcript lines:', transcriptLines);
        const lastLine = transcriptLines[transcriptLines.length - 1];
        console.log('Last line:', lastLine);
        if (lastLine && lastLine.trim()) {
          // Try different ways to detect speaker
          let speaker: 'user' | 'ai' | 'system' = 'system';
          let text = lastLine;
          
          if (lastLine.toLowerCase().includes('agent:') || lastLine.toLowerCase().includes('ai:')) {
            speaker = 'ai';
            text = lastLine.replace(/^(agent|ai):\s*/i, '');
          } else if (lastLine.toLowerCase().includes('user:') || lastLine.toLowerCase().includes('you:')) {
            speaker = 'user';
            text = lastLine.replace(/^(user|you):\s*/i, '');
          } else {
            // If no clear speaker indicator, assume it's user input
            speaker = 'user';
            text = lastLine;
          }
          
          console.log('Parsed message:', { speaker, text });
          
          const message = {
            speaker,
            text: text.trim(),
            timestamp: new Date().toLocaleTimeString(),
            messageId: `msg_${Date.now()}_${Math.random()}`,
          };
          
          console.log('Sending message to parent:', message);
          onMessage?.(message);
        }
      }
    });
    
    retellWebClient.on('error', (err: any) => {
      setError(err?.message || 'Unknown error');
      onStateChange?.({ isConnected: false, isCalling: false, error: err?.message || 'Unknown error' });
      retellWebClient.stopCall();
    });
    
    return () => {
      retellWebClient.removeAllListeners && retellWebClient.removeAllListeners();
    };
  }, [onMessage, onStateChange, onStart, onStop]);

  const startCall = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/retell-web-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agentId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to register call: ${errorData.error || response.statusText}`);
      }
      const data = await response.json();
      console.log('Retell API response:', data);
      if (data.access_token) {
        await retellWebClient.startCall({ accessToken: data.access_token });
      } else {
        throw new Error('No access_token received');
      }
    } catch (err: any) {
      console.error('Error starting call:', err);
      setError(err.message || 'Failed to start call');
      onStateChange?.({ isConnected: false, isCalling: false, error: err.message || 'Failed to start call' });
    }
  }, [onStateChange]);

  const stopCall = useCallback(() => {
    retellWebClient.stopCall();
    setIsCalling(false);
    onStop?.();
  }, [onStop]);

  const toggleMute = useCallback((mute: boolean) => {
    setIsMuted(mute);
    // Note: Retell SDK doesn't have setMuted method, so we just track the state
    // The actual muting will need to be handled differently if needed
  }, []);

  useEffect(() => {
    (window as any).retellConversation = {
      start: startCall,
      stop: stopCall,
      toggleMute: toggleMute,
      status: isCalling ? 'connected' : 'disconnected',
      isMuted: isMuted,
    };
    return () => {
      if ((window as any).retellConversation) {
        delete (window as any).retellConversation;
      }
    };
  }, [startCall, stopCall, toggleMute, isCalling, isMuted]);

  // Return null - this component should be invisible!
  return null;
};

export default RetellConversation; 