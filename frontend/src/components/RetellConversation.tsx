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
  const lastProcessedMessage = useRef<string>('');
  const currentTranscript = useRef<string>('');
  const messageBuffer = useRef<ConversationMessage[]>([]);

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
        // Convert our built transcript to messages and send them
        const lines = transcriptToSend.split('\n').filter(line => line.trim());
        lines.forEach((line, index) => {
          const message = parseTranscriptLine(line);
          if (message) {
            // Mark this as a transcript message so it doesn't get typewriter animation
            const transcriptMessage = { ...message, isTranscriptMessage: true };
            onMessage?.(transcriptMessage);
          }
        });
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
        
        // Comment out other handlers to prevent duplicate messages
        /*
        // Handle real-time transcript events
        if (update.real_time_transcript) {
          handleRealTimeTranscript(update.real_time_transcript);
        }
        
        // Handle individual transcript events
        if (update.transcript_event) {
          handleTranscriptEvent(update.transcript_event);
        }
        
        // Handle conversation events
        if (update.conversation_event) {
          handleConversationEvent(update.conversation_event);
        }
        
        // Handle agent response events
        if (update.agent_response) {
          handleAgentResponse(update.agent_response);
        }
        
        // Handle user speech events
        if (update.user_speech) {
          handleUserSpeech(update.user_speech);
        }
        
        // Handle any other potential transcript-related fields
        if (update.text) {
          console.log('Found text field:', update.text);
          // This might be a direct transcript
          const message = {
            speaker: 'user' as const,
            text: update.text.trim(),
            timestamp: new Date().toLocaleTimeString(),
            messageId: `msg_${Date.now()}_${Math.random()}`,
          };
          console.log('Sending text message:', message);
          onMessage?.(message);
        }
        
        // Handle any message-like structure
        if (update.message) {
          console.log('Found message field:', update.message);
          const speaker: 'user' | 'ai' = update.role === 'agent' ? 'ai' : 'user';
          const message = {
            speaker,
            text: update.message.trim(),
            timestamp: new Date().toLocaleTimeString(),
            messageId: `msg_${Date.now()}_${Math.random()}`,
          };
          console.log('Sending message field:', message);
          onMessage?.(message);
        }
        */
      }
      
      // Also handle direct transcript updates without event_type
      if (update.transcript && !update.event_type) {
        console.log('Direct transcript update:', update.transcript);
        handleTranscriptUpdate(update.transcript);
      }
      
      // Comment out direct content handler to prevent duplicates
      /*
      // Handle any direct message content
      if (update.content && !update.event_type) {
        console.log('Direct content update:', update.content);
        const speaker: 'user' | 'ai' = update.speaker === 'agent' ? 'ai' : 'user';
        const message = {
          speaker,
          text: update.content.trim(),
          timestamp: new Date().toLocaleTimeString(),
          messageId: `msg_${Date.now()}_${Math.random()}`,
        };
        console.log('Sending direct content message:', message);
        onMessage?.(message);
      }
      */
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
  }, [onMessage, onStateChange, onStart, onStop]);

  // State to track the full transcript (but don't send messages during conversation)
  const [fullTranscript, setFullTranscript] = useState<string>('');
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState<string>('');
  
  // Ref to track the current transcript synchronously
  const currentTranscriptRef = useRef<string>('');
  




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
    
    // Handle string transcript (legacy format)
    if (typeof transcript === 'string') {
      if (transcript === currentTranscript.current) {
        return; // No change
      }
      
      // Parse the transcript to extract individual messages
      const lines = transcript.split('\n').filter(line => line.trim());
      const newLines = lines.filter(line => !currentTranscript.current.includes(line));
      
      newLines.forEach((line, index) => {
        const message = parseTranscriptLine(line);
        if (message) {
          console.log('Sending transcript message:', message);
          onMessage?.(message);
        }
      });
      
      currentTranscript.current = transcript;
    }
  };

  // Handle real-time transcript events
  const handleRealTimeTranscript = (realTimeData: any) => {
    console.log('Real-time transcript:', realTimeData);
    // Commented out to prevent duplicate messages - using handleTranscriptUpdate instead
    /*
    if (realTimeData.speaker && realTimeData.text) {
      const speaker: 'user' | 'ai' = realTimeData.speaker === 'agent' ? 'ai' : 'user';
      const message = {
        speaker,
        text: realTimeData.text.trim(),
        timestamp: new Date().toLocaleTimeString(),
        messageId: `msg_${Date.now()}_${Math.random()}`,
      };
      
      console.log('Sending real-time message:', message);
      onMessage?.(message);
    }
    */
  };

  // Handle individual transcript events
  const handleTranscriptEvent = (event: any) => {
    console.log('Transcript event:', event);
    // Commented out to prevent duplicate messages - using handleTranscriptUpdate instead
    /*
    if (event.speaker && event.text) {
      const speaker: 'user' | 'ai' = event.speaker === 'agent' ? 'ai' : 'user';
      const message = {
        speaker,
        text: event.text.trim(),
        timestamp: new Date().toLocaleTimeString(),
        messageId: `msg_${Date.now()}_${Math.random()}`,
      };
      
      console.log('Sending transcript event message:', message);
      onMessage?.(message);
    }
    */
  };

  // Handle conversation events
  const handleConversationEvent = (event: any) => {
    console.log('Conversation event:', event);
    // Commented out to prevent duplicate messages - using handleTranscriptUpdate instead
    /*
    if (event.type === 'message' && event.content) {
      const speaker: 'user' | 'ai' = event.role === 'agent' ? 'ai' : 'user';
      const message = {
        speaker,
        text: event.content.trim(),
        timestamp: new Date().toLocaleTimeString(),
        messageId: `msg_${Date.now()}_${Math.random()}`,
      };
      
      console.log('Sending conversation message:', message);
      onMessage?.(message);
    }
    */
  };

  // Handle agent response events
  const handleAgentResponse = (response: any) => {
    console.log('Agent response:', response);
    // Commented out to prevent duplicate messages - using handleTranscriptUpdate instead
    /*
    if (response.text) {
      const message = {
        speaker: 'ai' as const,
        text: response.text.trim(),
        timestamp: new Date().toLocaleTimeString(),
        messageId: `msg_${Date.now()}_${Math.random()}`,
      };
      
      console.log('Sending agent response message:', message);
      onMessage?.(message);
    }
    */
  };

  // Handle user speech events
  const handleUserSpeech = (speech: any) => {
    console.log('User speech:', speech);
    // Commented out to prevent duplicate messages - using handleTranscriptUpdate instead
    /*
    if (speech.text) {
      const message = {
        speaker: 'user' as const,
        text: speech.text.trim(),
        timestamp: new Date().toLocaleTimeString(),
        messageId: `msg_${Date.now()}_${Math.random()}`,
      };
      
      console.log('Sending user speech message:', message);
      onMessage?.(message);
    }
    */
  };

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



  // Return null - this component should be invisible!
  return null;
};

export default RetellConversation; 