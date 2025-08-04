import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RetellWebClient } from 'retell-client-js-sdk';

const agentId = 'agent_302093d9c369a0189b50c7de42';
const retellWebClient = new RetellWebClient();

export interface ConversationMessage {
  speaker: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  messageId: string;
  isTranscriptMessage?: boolean;
  shouldTypewriter?: boolean;
}

interface RetellConversationProps {
  onMessage?: (message: ConversationMessage) => void;
  onStateChange?: (state: { isConnected: boolean; isCalling: boolean; error: string | null }) => void;
  onStart?: () => void;
  onStop?: () => void;
  onGenerateTitle?: (transcript: string) => Promise<void>;
  onTranscriptComplete?: (messages: ConversationMessage[]) => void;
}

export const RetellConversation: React.FC<RetellConversationProps> = ({
  onMessage,
  onStateChange,
  onStart,
  onStop,
  onGenerateTitle,
  onTranscriptComplete,
}) => {
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastProcessedMessage = useRef<string>('');
  const currentTranscript = useRef<string>('');
  const messageBuffer = useRef<ConversationMessage[]>([]);

  // State to track the full transcript (but don't send messages during conversation)
  const [fullTranscript, setFullTranscript] = useState<string>('');
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState<string>('');
  
  // Ref to track the current transcript synchronously
  const currentTranscriptRef = useRef<string>('');

  // Parse a transcript line to extract speaker and text
  const parseTranscriptLine = (line: string): ConversationMessage | null => {
    if (!line.trim()) return null;
    
    let speaker: 'user' | 'ai' = 'user';
    let text = line;
    
    // Check for our specific transcript format
    if (line.startsWith('EchoLearn:')) {
      speaker = 'ai';
      text = line.replace(/^EchoLearn:\s*/, '');
    } else if (line.startsWith('You:')) {
      speaker = 'user';
      text = line.replace(/^You:\s*/, '');
    } else {
      // Fallback patterns for other formats
      if (line.toLowerCase().includes('agent:') || line.toLowerCase().includes('ai:')) {
        speaker = 'ai';
        text = line.replace(/^(agent|ai):\s*/i, '');
      } else if (line.toLowerCase().includes('user:') || line.toLowerCase().includes('you:')) {
        speaker = 'user';
        text = line.replace(/^(user|you):\s*/i, '');
      } else {
        // If no clear indicator, default to user
        speaker = 'user';
      }
    }
    
    if (text.trim()) {
      return {
        speaker,
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString(),
        messageId: `msg_${Date.now()}_${Math.random()}`,
      };
    }
    
    return null;
  };

  // Handle transcript updates to build the full transcript
  const handleTranscriptUpdate = (transcript: any) => {
    // Handle array of transcript objects
    if (Array.isArray(transcript)) {
      // Create a unique key for this transcript update
      const transcriptKey = JSON.stringify(transcript);
      if (transcriptKey === lastProcessedTranscript) {
        return; // No change
      }
      
      // Build the full transcript from the array
      let transcriptText = '';
      for (let i = 0; i < transcript.length; i++) {
        const item = transcript[i];
        if (item.role && item.content) {
          const speaker = item.role === 'agent' ? 'EchoLearn' : 'You';
          transcriptText += `${speaker}: ${item.content.trim()}\n`;
        }
      }
      
      // Update the full transcript
      const trimmedTranscript = transcriptText.trim();
      setFullTranscript(trimmedTranscript);
      currentTranscriptRef.current = trimmedTranscript; // Update ref synchronously
      setLastProcessedTranscript(transcriptKey);
      return;
    }
    
    // Handle string transcript (legacy format) - just store it, don't send individual messages
    if (typeof transcript === 'string') {
      if (transcript === currentTranscriptRef.current) {
        return; // No change
      }
      
      // Just update the current transcript without sending individual messages
      // Messages will be sent all at once when the call ends
      currentTranscriptRef.current = transcript;
    }
  };

  // Generate conversation title from transcript
  const generateConversationTitle = async (transcript: string) => {
    if (!transcript.trim() || !onGenerateTitle) {
      console.log('Skipping title generation - no transcript or callback');
      return;
    }
    
    try {
      console.log('Generating conversation title from transcript...');
      console.log('Transcript length:', transcript.length);
      console.log('Transcript preview:', transcript.substring(0, 200) + '...');
      await onGenerateTitle(transcript);
      console.log('Title generation completed successfully');
    } catch (error) {
      console.error('Error generating conversation title:', error);
    }
  };

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

  // Expose methods globally for the conversation service
  useEffect(() => {
    // Create the global retellConversation object
    (window as any).retellConversation = {
      start: startCall,
      stop: stopCall,
      toggleMute: (muted: boolean) => toggleMute(muted),
      isMuted: () => isMuted,
      status: isCalling ? 'connected' : 'disconnected'
    };

    // Cleanup function to remove the global object
    return () => {
      delete (window as any).retellConversation;
    };
  }, [startCall, stopCall, toggleMute, isMuted, isCalling]);

  useEffect(() => {
    retellWebClient.on('call_started', () => {
      // Reset transcript state
      setFullTranscript('');
      currentTranscriptRef.current = '';
      setLastProcessedTranscript('');
      
      setIsCalling(true);
      setError(null);
      onStateChange?.({ isConnected: true, isCalling: true, error: null });
      onStart?.();
    });
    
    retellWebClient.on('call_ended', () => {
      // Use the ref to get the current transcript synchronously
      const transcriptToSend = currentTranscriptRef.current;
      
      // Send the full transcript as messages when call ends
      if (transcriptToSend.trim()) {
        // Convert our built transcript to messages
        const lines = transcriptToSend.split('\n').filter(line => line.trim());
        const transcriptMessages: ConversationMessage[] = [];
        
        lines.forEach((line, index) => {
          const message = parseTranscriptLine(line);
          if (message) {
            // Mark this as a transcript message so it doesn't get typewriter animation
            const transcriptMessage = { ...message, isTranscriptMessage: true };
            transcriptMessages.push(transcriptMessage);
          }
        });
        
        // Send all transcript messages at once to replace existing messages
        if (transcriptMessages.length > 0 && onTranscriptComplete) {
          console.log('Sending complete transcript with', transcriptMessages.length, 'messages');
          onTranscriptComplete(transcriptMessages);
        }
        
        // Generate conversation title from the transcript
        generateConversationTitle(transcriptToSend);
      }
      
      // Reset state
      setFullTranscript('');
      currentTranscriptRef.current = '';
      setLastProcessedTranscript('');
      
      setIsCalling(false);
      onStateChange?.({ isConnected: false, isCalling: false, error: null });
      onStop?.();
    });
    
    // Handle all Retell events
    retellWebClient.on('update', (update: any) => {
      // Handle different event types based on event_type
      if (update.event_type === 'update') {
        // Only handle transcript updates - disable other handlers to prevent duplicates
        if (update.transcript) {
          handleTranscriptUpdate(update.transcript);
        }
      }
      
      // Also handle direct transcript updates without event_type
      if (update.transcript && !update.event_type) {
        console.log('Direct transcript update:', update.transcript);
        handleTranscriptUpdate(update.transcript);
      }
    });
    
    // Handle agent talking events
    retellWebClient.on('agent_start_talking', () => {
      // Agent started talking
    });
    
    retellWebClient.on('agent_stop_talking', () => {
      // Agent stopped talking
    });
    
    // Handle metadata events
    retellWebClient.on('metadata', (metadata: any) => {
      // Handle any metadata that might contain transcript info
      if (metadata.transcript) {
        handleTranscriptUpdate(metadata.transcript);
      }
    });
    
    // Handle node transition events
    retellWebClient.on('node_transition', (transition: any) => {
      // Handle any transcript info in transitions
      if (transition.transcript) {
        handleTranscriptUpdate(transition.transcript);
      }
    });
    
    retellWebClient.on('error', (err: any) => {
      console.error('Retell error:', err);
      setError(err?.message || 'Unknown error');
      onStateChange?.({ isConnected: false, isCalling: false, error: err?.message || 'Unknown error' });
      retellWebClient.stopCall();
    });
    
    return () => {
      retellWebClient.removeAllListeners && retellWebClient.removeAllListeners();
    };
  }, [onMessage, onStateChange, onStart, onStop, lastProcessedTranscript]);

  // Return null - this component should be invisible!
  return null;
};

export default RetellConversation; 