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
  const [transcript, setTranscript] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const transcriptRef = useRef<string[]>([]);
  const originalStream = useRef<MediaStream | null>(null);

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
      if (update.transcript) {
        transcriptRef.current = update.transcript.split('\n');
        setTranscript([...transcriptRef.current]);
        const lastLine = transcriptRef.current[transcriptRef.current.length - 1];
        if (lastLine) {
          const speaker = lastLine.startsWith('Agent:') ? 'ai' : lastLine.startsWith('User:') ? 'user' : 'system';
          const text = lastLine.replace(/^\w+: /, '');
          onMessage?.({
            speaker: speaker as 'user' | 'ai' | 'system',
            text,
            timestamp: new Date().toLocaleTimeString(),
            messageId: `msg_${Date.now()}_${Math.random()}`,
          });
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
    // eslint-disable-next-line
  }, []);

  const startCall = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/retell-web-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agentId }),
      });
      if (!response.ok) throw new Error('Failed to register call');
      const data = await response.json();
      if (data.access_token) {
        await retellWebClient.startCall({ accessToken: data.access_token });
      } else {
        throw new Error('No access_token received');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start call');
      onStateChange?.({ isConnected: false, isCalling: false, error: err.message || 'Failed to start call' });
    }
  }, [onStateChange, onStart]);

  const stopCall = useCallback(() => {
    retellWebClient.stopCall();
    setIsCalling(false);
    onStop?.();
  }, [onStop]);

  const toggleMute = useCallback((mute: boolean) => {
    setIsMuted(mute);
    // Directly control the microphone tracks
    if (originalStream.current) {
      const audioTracks = originalStream.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !mute;
      });
    }
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

  return (
    <div style={{ padding: 16 }}>
      <button onClick={isCalling ? stopCall : startCall} style={{ marginBottom: 12 }}>
        {isCalling ? 'Stop Call' : 'Start Call'}
      </button>
      <button onClick={() => toggleMute(!isMuted)} disabled={!isCalling} style={{ marginLeft: 8 }}>
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
      <div style={{ marginTop: 16, background: '#222', color: '#fff', padding: 12, borderRadius: 8, minHeight: 80 }}>
        <strong>Transcript:</strong>
        <div style={{ marginTop: 8 }}>
          {transcript.length === 0 ? <em>No conversation yet.</em> : transcript.map((line, idx) => <div key={idx}>{line}</div>)}
        </div>
      </div>
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
    </div>
  );
};

export default RetellConversation; 