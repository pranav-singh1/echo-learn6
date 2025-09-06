import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RetellWebClient } from 'retell-client-js-sdk';
import { useAuth } from '../contexts/AuthContext';

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
  const [callId, setCallId] = useState<string | null>(null);
  const { user } = useAuth();

  // State to track the full transcript (but don't send messages during conversation)
  const [fullTranscript, setFullTranscript] = useState<string>('');
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState<string>('');
  
  // Ref to track the current transcript synchronously
  const currentTranscriptRef = useRef<string>('');
  
  // Prevent multiple simultaneous calls and track initialization
  const isStartingCallRef = useRef(false);
  const isInitializedRef = useRef(false);

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
  const handleTranscriptUpdate = useCallback((transcript: any) => {
    try {
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
          if (item && item.role && item.content && typeof item.content === 'string') {
            const speaker = item.role === 'agent' ? 'EchoLearn' : 'You';
            transcriptText += `${speaker}: ${item.content.trim()}\n`;
          }
        }
        
        // Update the full transcript
        const trimmedTranscript = transcriptText.trim();
        if (trimmedTranscript !== currentTranscriptRef.current) {
          setFullTranscript(trimmedTranscript);
          currentTranscriptRef.current = trimmedTranscript; // Update ref synchronously
          setLastProcessedTranscript(transcriptKey);
        }
        return;
      }
      
      // Handle string transcript (legacy format) - just store it, don't send individual messages
      if (typeof transcript === 'string' && transcript.trim()) {
        if (transcript === currentTranscriptRef.current) {
          return; // No change
        }
        
        // Just update the current transcript without sending individual messages
        // Messages will be sent all at once when the call ends
        currentTranscriptRef.current = transcript;
      }
    } catch (error) {
      console.error('Error handling transcript update:', error);
    }
  }, [lastProcessedTranscript]);

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
      // Prevent multiple simultaneous calls
      if (isStartingCallRef.current || isCalling) {
        console.log('Call already in progress, ignoring start request');
        return;
      }

      console.log('Starting Retell call...');
      isStartingCallRef.current = true;
      setError(null);
      
      const response = await fetch('/api/retell-web-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id || undefined }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to register call: ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      if (data.call_id) {
        setCallId(data.call_id);
      } else if (data.id) {
        setCallId(data.id);
      }
      
      if (data.access_token) {
        await retellWebClient.startCall({ accessToken: data.access_token });
      } else {
        throw new Error('No access_token received');
      }
      
      console.log('Retell call started successfully');
    } catch (err: any) {
      console.error('Error starting call:', err);
      setError(err.message || 'Failed to start call');
      onStateChange?.({ isConnected: false, isCalling: false, error: err.message || 'Failed to start call' });
    } finally {
      isStartingCallRef.current = false;
    }
  }, [onStateChange, user?.id, isCalling]);

  const stopCall = useCallback(() => {
    console.log('Stopping Retell call...');
    try {
      retellWebClient.stopCall();
    } catch (err) {
      console.error('Error stopping call:', err);
    }
    setIsCalling(false);
    isStartingCallRef.current = false;
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
      status: isCalling ? 'connected' : 'disconnected',
      isStarting: () => isStartingCallRef.current
    };

    // Cleanup function to remove the global object
    return () => {
      delete (window as any).retellConversation;
    };
  }, [startCall, stopCall, toggleMute, isMuted, isCalling]);

  useEffect(() => {
    if (isInitializedRef.current) {
      return; // Already initialized
    }
    
    console.log('Initializing Retell Web Client...');
    isInitializedRef.current = true;
    
    retellWebClient.on('call_started', () => {
      console.log('Retell call started event received');
      // Reset transcript state
      setFullTranscript('');
      currentTranscriptRef.current = '';
      setLastProcessedTranscript('');
      
      setIsCalling(true);
      setError(null);
      isStartingCallRef.current = false; // Call successfully started
      onStateChange?.({ isConnected: true, isCalling: true, error: null });
      onStart?.();
    });
    
    retellWebClient.on('call_ended', async () => {
      console.log('Retell call ended event received');
      
      // Fetch complete transcript from Retell API (single request for both transcript and usage)
      if (callId) {
        try {
          console.log('Fetching call data from Retell API for call:', callId);
          const response = await fetch('/api/retell-get-call', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ call_id: callId }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Received call data:', data);
            
            // Process transcript if available
            if (data.transcript && Array.isArray(data.transcript)) {
              // Parse API transcript into messages
              const transcriptMessages: ConversationMessage[] = [];
              
              data.transcript.forEach((item: any, index: number) => {
                if (item && item.role && item.content && typeof item.content === 'string') {
                  const speaker = item.role === 'agent' ? 'ai' : 'user';
                  const message: ConversationMessage = {
                    speaker,
                    text: item.content.trim(),
                    timestamp: new Date().toLocaleTimeString(),
                    messageId: `transcript_${index}_${Date.now()}`,
                    isTranscriptMessage: true,
                    shouldTypewriter: false
                  };
                  transcriptMessages.push(message);
                }
              });
              
              // Send transcript messages to UI
              if (transcriptMessages.length > 0 && onTranscriptComplete) {
                console.log('Sending API transcript with', transcriptMessages.length, 'messages');
                onTranscriptComplete(transcriptMessages);
              }
              
              // Generate conversation title from the full transcript
              const transcriptText = data.transcript.map((item: any) => {
                if (item && item.role && item.content) {
                  const speaker = item.role === 'agent' ? 'EchoLearn' : 'You';
                  return `${speaker}: ${item.content.trim()}`;
                }
                return '';
              }).filter(line => line).join('\n');
              
              if (transcriptText.trim()) {
                await generateConversationTitle(transcriptText);
              }
            } else {
              console.log('No transcript found in API response');
            }
            
            // NOTE: Voice usage tracking is now handled by VapiConversation component
            // This prevents double-counting when both Retell and Vapi are used
            console.log('Retell call ended - voice usage tracking handled by VapiConversation');
          } else {
            console.error('Failed to fetch call data from API:', response.status);
          }
        } catch (error) {
          console.error('Error fetching call data from API:', error);
        }
      } else {
        console.log('No call ID available for call data fetch');
      }
      
      // Reset state
      setFullTranscript('');
      currentTranscriptRef.current = '';
      setLastProcessedTranscript('');
      
      setIsCalling(false);
      isStartingCallRef.current = false;
      onStateChange?.({ isConnected: false, isCalling: false, error: null });
      onStop?.();
    });
    
    // Handle all Retell events
    retellWebClient.on('update', (update: any) => {
      try {
        // Handle different event types based on event_type
        if (update.event_type === 'update') {
          // Only handle transcript updates - disable other handlers to prevent duplicates
          if (update.transcript) {
            handleTranscriptUpdate(update.transcript);
          }
        }
        
        // Also handle direct transcript updates without event_type
        if (update.transcript && !update.event_type) {
          handleTranscriptUpdate(update.transcript);
        }
      } catch (error) {
        console.error('Error handling Retell update:', error);
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
      try {
        // Handle any metadata that might contain transcript info
        if (metadata && metadata.transcript) {
          handleTranscriptUpdate(metadata.transcript);
        }
      } catch (error) {
        console.error('Error handling metadata:', error);
      }
    });
    
    // Handle node transition events
    retellWebClient.on('node_transition', (transition: any) => {
      try {
        // Handle any transcript info in transitions
        if (transition && transition.transcript) {
          handleTranscriptUpdate(transition.transcript);
        }
      } catch (error) {
        console.error('Error handling node transition:', error);
      }
    });
    
    retellWebClient.on('error', (err: any) => {
      console.error('Retell error:', err);
      setError(err?.message || 'Unknown error');
      onStateChange?.({ isConnected: false, isCalling: false, error: err?.message || 'Unknown error' });
      isStartingCallRef.current = false;
      setIsCalling(false);
      try {
        retellWebClient.stopCall();
      } catch (stopError) {
        console.error('Error stopping call after error:', stopError);
      }
    });
    
    // Prevent automatic reconnection attempts by overriding reconnect behavior
    retellWebClient.on('disconnect', () => {
      console.log('Retell disconnected - preventing auto-reconnect');
      isStartingCallRef.current = false;
      setIsCalling(false);
    });
    
    return () => {
      console.log('Cleaning up Retell Web Client...');
      if (retellWebClient.removeAllListeners) {
        retellWebClient.removeAllListeners();
      }
      isInitializedRef.current = false;
    };
  }, []); // Empty dependency array to prevent re-initialization

  // Return null - this component should be invisible!
  return null;
};

export default RetellConversation; 