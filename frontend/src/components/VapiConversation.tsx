import React, { useCallback, useEffect, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';
import { useAuth } from '../contexts/AuthContext';

export interface ConversationMessage {
  speaker: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  messageId: string;
  isTranscriptMessage?: boolean;
  shouldTypewriter?: boolean;
}

interface VapiConversationProps {
  onMessage?: (message: ConversationMessage) => void;
  onStateChange?: (state: { isConnected: boolean; isCalling: boolean; error: string | null }) => void;
  onStart?: () => void;
  onStop?: () => void;
  onGenerateTitle?: () => Promise<void>;
  onTranscriptComplete?: (messages: ConversationMessage[]) => void;
}

export const VapiConversation: React.FC<VapiConversationProps> = ({
  onMessage,
  onStateChange,
  onStart,
  onStop,
  onGenerateTitle,
  onTranscriptComplete,
}) => {
  console.log('🚀 VapiConversation component initialized');
  
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Vapi instance and state management
  const vapiRef = useRef<Vapi | null>(null);
  const isStartingCallRef = useRef(false);
  const isInitializedRef = useRef(false);
  
  // Message tracking
  const messageCounterRef = useRef(0);

  // Deduplication and message grouping for final transcripts
  const lastTranscriptRef = useRef<string>('');
  const lastSpeakerRef = useRef<string>('');
  const messageGroupingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingMessageRef = useRef<ConversationMessage | null>(null);

  // Sentence-level buffering for complete transcriptions
  const transcriptionBufferRef = useRef<{ [speaker: string]: string }>({});
  const sentenceEndings = ['.', '!', '?', '。', '！', '？'];



  // Initialize Vapi instance
  useEffect(() => {
    if (isInitializedRef.current) return;
    
    try {
      console.log('Initializing Vapi client...');
      
      // Get public API key from environment (Vite uses import.meta.env)
      const publicApiKey = import.meta.env.VITE_VAPI_PUBLIC_API_KEY;
      
      if (!publicApiKey) {
        console.error('Vapi public API key not found in environment variables');
        setError('Vapi API key not configured');
        return;
      }

      vapiRef.current = new Vapi(publicApiKey);
      isInitializedRef.current = true;
      
      console.log('Vapi client initialized successfully');
      
    } catch (err) {
      console.error('Failed to initialize Vapi:', err);
      setError('Failed to initialize voice client');
    }
  }, []);

  // Set up Vapi event listeners
  useEffect(() => {
    if (!vapiRef.current || !isInitializedRef.current) return;
    
    const vapi = vapiRef.current;
    
    // Call started
    vapi.on('call-start', () => {
      console.log('Vapi call started');
      setIsCalling(true);
      setError(null);
      isStartingCallRef.current = false;
      
      // Reset transcript state
      messageCounterRef.current = 0;
      lastTranscriptRef.current = '';
      lastSpeakerRef.current = '';

      // Reset transcription buffers
      transcriptionBufferRef.current = {};



      // Reset speaker tracking
      lastSpeakerStateRef.current = null;
      currentMessageRef.current = null;
      
      // Clear any pending messages and timeouts
      if (pendingMessageRef.current) {
        pendingMessageRef.current = null;
      }
      if (messageGroupingTimeoutRef.current) {
        clearTimeout(messageGroupingTimeoutRef.current);
        messageGroupingTimeoutRef.current = null;
      }
      
      // NO LIVE MESSAGES during call - keep chat clean
      
      onStateChange?.({ isConnected: true, isCalling: true, error: null });
      onStart?.();
    });

    // Call ended
    vapi.on('call-end', async () => {
      console.log('🔚 Vapi call ended - processing end logic');
      setIsCalling(false);
      isStartingCallRef.current = false;

      // Flush any remaining buffered transcriptions
      Object.entries(transcriptionBufferRef.current).forEach(([speaker, bufferedText]) => {
        if (bufferedText.trim()) {
          const speakerType: 'ai' | 'user' = speaker === 'ai' ? 'ai' : 'user';

          // Check if speaker changed - if so, create NEW message
          if (lastSpeakerStateRef.current !== speakerType) {
            currentMessageRef.current = {
              speaker: speakerType,
              text: bufferedText.trim(),
              timestamp: new Date().toLocaleTimeString(),
              messageId: `${speakerType}_${Date.now()}_${messageCounterRef.current++}`,
              isTranscriptMessage: true,
              shouldTypewriter: false
            };
            lastSpeakerStateRef.current = speakerType;
            console.log(`FINAL ${speakerType} message:`, bufferedText.trim());

            // Send FINAL message to UI
            if (onMessage) {
              onMessage({...currentMessageRef.current});
            }
            
            // Final message sent to UI - AppContext will handle storage
          } else {
            // SAME SPEAKER = UPDATE existing message
            if (currentMessageRef.current) {
              currentMessageRef.current.text += (currentMessageRef.current.text ? ' ' : '') + bufferedText.trim();
              currentMessageRef.current.timestamp = new Date().toLocaleTimeString();
              console.log(`FINAL UPDATED ${speakerType} message:`, currentMessageRef.current.text);

              // Send FINAL UPDATE to UI (same messageId)
              if (onMessage) {
                onMessage({...currentMessageRef.current});
              }
              
              // Final message updated in UI - AppContext will handle storage updates
            }
          }
        }
      });

      // Clear all buffers
      transcriptionBufferRef.current = {};

      // Finalize any pending message before ending
      if (pendingMessageRef.current) {
        pendingMessageRef.current = null;
      }

      // DON'T add "Conversation ended" here - AppContext handles it
      console.log('Call ended - letting AppContext handle the end message');

      // NO TRANSCRIPT COMPLETION - let UI messages be the source of truth
      console.log('Transcript completion disabled - UI messages are the source of truth');

      // Generate title after conversation ends
      setTimeout(async () => {
        try {
          if (onGenerateTitle) {
            console.log('TITLE: Voice conversation ended, generating title...');
            await onGenerateTitle();
          }
        } catch (error) {
          console.error('TITLE: Error generating title:', error);
        }
      }, 1000); // Wait 1 second after conversation ends

      onStateChange?.({ isConnected: false, isCalling: false, error: null });
      onStop?.();
    });

    // Real-time messages (including transcripts)
    vapi.on('message', (message: any) => {
      try {
        console.log('Vapi message received:', message);
        
        if (message.type === 'transcript') {
          console.log('Vapi transcript message:', message);
          // ONLY process final transcripts - completely ignore interim ones
          if (message.transcriptType === 'final') {
            handleTranscriptMessage(message);
          } else {
            console.log('Skipping non-final transcript:', message.transcript, 'type:', message.transcriptType);
          }
        } else if (message.type === 'error') {
          console.error('Vapi error message:', message);
          setError(message.error || 'Voice service error');
        }
      } catch (error) {
        console.error('Error handling Vapi message:', error);
      }
    });

    // Error handling
    vapi.on('error', (err: any) => {
      console.error('Vapi error:', err);
      setError(err?.message || 'Voice service error');
      setIsCalling(false);
      isStartingCallRef.current = false;
      onStateChange?.({ isConnected: false, isCalling: false, error: err?.message || 'Voice service error' });
    });

    return () => {
      console.log('Cleaning up Vapi event listeners...');
      if (vapi.removeAllListeners) {
        vapi.removeAllListeners();
      }
      
      // Finalize pending messages and clean up timeouts
      if (pendingMessageRef.current) {
        pendingMessageRef.current = null;
      }
      if (messageGroupingTimeoutRef.current) {
        clearTimeout(messageGroupingTimeoutRef.current);
        messageGroupingTimeoutRef.current = null;
      }

      // Clear transcription buffers
      transcriptionBufferRef.current = {};


    };
  }, [onMessage, onStateChange, onStart, onStop, onGenerateTitle, onTranscriptComplete]);



  // SIMPLE WORKING APPROACH: Track last speaker and create new messages appropriately
  const lastSpeakerStateRef = useRef<'ai' | 'user' | null>(null);
  const currentMessageRef = useRef<ConversationMessage | null>(null);

  // Reset transcript state when component mounts (switching conversations)
  useEffect(() => {
    console.log('VapiConversation: Resetting state for new conversation');
    lastSpeakerStateRef.current = null;
    currentMessageRef.current = null;
    lastTranscriptRef.current = '';
    messageCounterRef.current = 0;
    transcriptionBufferRef.current = {};


  }, []);

  const handleTranscriptMessage = useCallback((message: any) => {
    try {
      // PREVENT TRANSCRIPT PROCESSING WHEN NOT IN ACTIVE CALL
      if (!isCalling) {
        console.log('BLOCKED: Ignoring transcript - not in active call');
        return;
      }

      const { role, transcript } = message;

      if (!transcript || typeof transcript !== 'string') {
        return;
      }

      const trimmedTranscript = transcript.trim();
      if (!trimmedTranscript) {
        return;
      }

      // Skip duplicates
      const transcriptKey = `${role}:${trimmedTranscript}`;
      if (lastTranscriptRef.current === transcriptKey) {
        return;
      }
      lastTranscriptRef.current = transcriptKey;

      const speaker: 'ai' | 'user' = role === 'assistant' ? 'ai' : 'user';

      // Initialize buffer for this speaker if needed
      if (!transcriptionBufferRef.current[speaker]) {
        transcriptionBufferRef.current[speaker] = '';
      }

      // Add new transcript to buffer
      transcriptionBufferRef.current[speaker] += (transcriptionBufferRef.current[speaker] ? ' ' : '') + trimmedTranscript;

      // Check if we have a complete sentence
      const bufferedText = transcriptionBufferRef.current[speaker];
      const hasSentenceEnding = sentenceEndings.some(ending => bufferedText.includes(ending));

      // If we have a complete sentence OR this is a significant pause (longer transcript), display it
      if (hasSentenceEnding || trimmedTranscript.length > 50) {
        // Extract complete sentences
        let remainingText = bufferedText;
        const completeSentences: string[] = [];

        while (remainingText) {
          const sentenceEndIndex = sentenceEndings.reduce((foundIndex, ending) => {
            const index = remainingText.indexOf(ending);
            return index !== -1 && (foundIndex === -1 || index < foundIndex) ? index + ending.length : foundIndex;
          }, -1);

          if (sentenceEndIndex === -1) {
            break; // No more complete sentences
          }

          const sentence = remainingText.substring(0, sentenceEndIndex).trim();
          if (sentence) {
            completeSentences.push(sentence);
          }
          remainingText = remainingText.substring(sentenceEndIndex).trim();
        }

        // Consolidate ALL complete sentences into one text block
        if (completeSentences.length > 0) {
          const consolidatedText = completeSentences.join(' ');
          
          // Check if speaker changed - if so, create NEW message
          if (lastSpeakerStateRef.current !== speaker) {
            // NEW SPEAKER = NEW MESSAGE (separate line)
            currentMessageRef.current = {
              speaker,
              text: consolidatedText,
              timestamp: new Date().toLocaleTimeString(),
              messageId: `${speaker}_${Date.now()}_${messageCounterRef.current++}`,
              isTranscriptMessage: true,
              shouldTypewriter: false
            };
            lastSpeakerStateRef.current = speaker;
            console.log(`NEW ${speaker} message:`, consolidatedText);

            // Send NEW message to UI
            if (onMessage) {
              onMessage({...currentMessageRef.current});
            }
            
            // Message sent to UI - AppContext will handle storage
          } else {
            // SAME SPEAKER = UPDATE existing message with ALL new sentences
            if (currentMessageRef.current) {
              currentMessageRef.current.text += (currentMessageRef.current.text ? ' ' : '') + consolidatedText;
              currentMessageRef.current.timestamp = new Date().toLocaleTimeString();
              console.log(`UPDATED ${speaker} message:`, currentMessageRef.current.text);

              // Send UPDATE to UI (same messageId)
              if (onMessage) {
                onMessage({...currentMessageRef.current});
              }
              
              // Message updated in UI - AppContext will handle storage updates
            }
          }
        }

        // Update buffer with remaining incomplete text
        transcriptionBufferRef.current[speaker] = remainingText;

        // If we have remaining text but it's been a while, display it after a delay
        if (remainingText && remainingText.length > 20) {
          setTimeout(() => {
            if (transcriptionBufferRef.current[speaker] === remainingText) {
              // Check if speaker changed - if so, create NEW message
              if (lastSpeakerStateRef.current !== speaker) {
                currentMessageRef.current = {
                  speaker,
                  text: remainingText,
                  timestamp: new Date().toLocaleTimeString(),
                  messageId: `${speaker}_${Date.now()}_${messageCounterRef.current++}`,
                  isTranscriptMessage: true,
                  shouldTypewriter: false
                };
                lastSpeakerStateRef.current = speaker;
                console.log(`NEW ${speaker} message (timeout):`, remainingText);

                // Send NEW message to UI
                if (onMessage) {
                  onMessage({...currentMessageRef.current});
                }
                
                // Timeout message sent to UI - AppContext will handle storage
              } else {
                // SAME SPEAKER = UPDATE existing message
                if (currentMessageRef.current) {
                  currentMessageRef.current.text += (currentMessageRef.current.text ? ' ' : '') + remainingText;
                  currentMessageRef.current.timestamp = new Date().toLocaleTimeString();
                  console.log(`UPDATED ${speaker} message (timeout):`, currentMessageRef.current.text);

                  // Send UPDATE to UI (same messageId)
                  if (onMessage) {
                    onMessage({...currentMessageRef.current});
                  }
                  
                  // Timeout message updated in UI - AppContext will handle storage updates
                }
              }

              // Clear the buffer
              transcriptionBufferRef.current[speaker] = '';
            }
          }, 2000); // 2 second delay for incomplete sentences
        }
      }

    } catch (error) {
      console.error('Error processing transcript message:', error);
    }
  }, [onMessage, isCalling]);



  // Start voice call
  const startCall = useCallback(async () => {
    try {
      console.log('🎤 VapiConversation startCall called');
      if (isStartingCallRef.current || isCalling) {
        console.log('Call already in progress, ignoring start request');
        return;
      }

      if (!vapiRef.current) {
        throw new Error('Vapi client not initialized. Please refresh the page and try again.');
      }

      console.log('Starting Vapi call...');
      isStartingCallRef.current = true;
      setError(null);

      // Your agent ID
      const assistantId = '6c66fa89-7edc-495d-9a4a-91530e131883';
      
      await vapiRef.current.start(assistantId);
      console.log('Vapi call start request sent');
      
    } catch (err: any) {
      console.error('Error starting Vapi call:', err);
      setError(err.message || 'Failed to start voice call');
      isStartingCallRef.current = false;
      onStateChange?.({ isConnected: false, isCalling: false, error: err.message || 'Failed to start voice call' });
    }
  }, [isCalling, onStateChange]);

  // Stop voice call
  const stopCall = useCallback(() => {
    try {
      console.log('🛑 VapiConversation stopCall called');
      console.log('Stopping Vapi call...');
      
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
      
      setIsCalling(false);
      isStartingCallRef.current = false;
      
    } catch (err) {
      console.error('Error stopping Vapi call:', err);
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback((mute: boolean) => {
    try {
      setIsMuted(mute);
      
      if (vapiRef.current && vapiRef.current.setMuted) {
        vapiRef.current.setMuted(mute);
        console.log(`Vapi call ${mute ? 'muted' : 'unmuted'}`);
      }
    } catch (err) {
      console.error('Error toggling mute:', err);
    }
  }, []);

  // Helper function to group transcript chunks by speaker turns
  const groupTranscriptByspeaker = (messages: ConversationMessage[]): ConversationMessage[] => {
    if (messages.length === 0) return [];
    
    const grouped: ConversationMessage[] = [];
    let currentSpeaker = messages[0].speaker;
    let currentText = messages[0].text;
    let currentTimestamp = messages[0].timestamp;
    let messageCounter = 1;
    
    for (let i = 1; i < messages.length; i++) {
      const message = messages[i];
      
      if (message.speaker === currentSpeaker) {
        // Same speaker - append text
        currentText += ` ${message.text}`;
        currentTimestamp = message.timestamp; // Use latest timestamp
      } else {
        // Different speaker - save current group and start new one
        grouped.push({
          speaker: currentSpeaker,
          text: currentText,
          timestamp: currentTimestamp,
          messageId: `grouped_${Date.now()}_${messageCounter++}`,
          isTranscriptMessage: true,
          shouldTypewriter: false
        });
        
        // Start new group
        currentSpeaker = message.speaker;
        currentText = message.text;
        currentTimestamp = message.timestamp;
      }
    }
    
    // Add the final group
    grouped.push({
      speaker: currentSpeaker,
      text: currentText,
      timestamp: currentTimestamp,
      messageId: `grouped_${Date.now()}_${messageCounter++}`,
      isTranscriptMessage: true,
      shouldTypewriter: false
    });
    
    return grouped;
  };

  // Expose methods globally for the conversation service
  useEffect(() => {
    (window as any).vapiConversation = {
      start: startCall,
      stop: stopCall,
      toggleMute: (muted: boolean) => toggleMute(muted),
      isMuted: () => isMuted,
      status: isCalling ? 'connected' : 'disconnected',
      isStarting: () => isStartingCallRef.current
    };

    return () => {
      delete (window as any).vapiConversation;
    };
  }, [startCall, stopCall, toggleMute, isMuted, isCalling]);

  // Return null - this component should be invisible!
  return null;
};

export default VapiConversation;
