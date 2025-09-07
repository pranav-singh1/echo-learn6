// Conversation service using Retell under the hood
import { ConversationMessage } from '../components/VapiConversation';
import { supabase } from './supabase';

export interface ConversationState {
  isConnected: boolean;
  isListening: boolean;
  messages: ConversationMessage[];
  error: string | null;
}

// This service connects to the Retell conversation component
export class ConversationService {
  private messageCallbacks: ((message: ConversationMessage) => void)[] = [];
  private stateCallbacks: ((state: Partial<ConversationState>) => void)[] = [];
  private messages: ConversationMessage[] = [];
  private isMuted: boolean = false;
  private currentSessionMessages: ConversationMessage[] = []; // Track current session messages separately

  constructor() {
    // Initialize the service
  }

  // Clear all messages (called when switching/creating sessions)
  clearMessages() {
    this.messages = [];
    this.currentSessionMessages = [];
  }

  // Set the current session messages (called when switching sessions)
  setSessionMessages(messages: ConversationMessage[]) {
    this.currentSessionMessages = [...messages];
  }

  // Subscribe to message updates
  onMessage(callback: (message: ConversationMessage) => void): () => void {
    this.messageCallbacks.push(callback);
    return () => {
      const index = this.messageCallbacks.indexOf(callback);
      if (index > -1) {
        this.messageCallbacks.splice(index, 1);
      }
    };
  }

  // Subscribe to state changes
  onStateChange(callback: (state: Partial<ConversationState>) => void): () => void {
    this.stateCallbacks.push(callback);
    return () => {
      const index = this.stateCallbacks.indexOf(callback);
      if (index > -1) {
        this.stateCallbacks.splice(index, 1);
      }
    };
  }

  // Update state and notify subscribers
  updateState(state: Partial<ConversationState>) {
    this.stateCallbacks.forEach(callback => callback(state));
  }

  // Start conversation
  async startConversation(): Promise<void> {
    try {
      console.log('ConversationService: Starting conversation...');
      
      // Check if already starting/connected (now using Vapi)
      const vapi = (window as any).vapiConversation;
      if (vapi && vapi.isStarting && vapi.isStarting()) {
        console.log('Conversation already starting, skipping...');
        return;
      }
      
      this.updateState({ isConnected: false, isListening: true, error: null });
      
      // Start the Vapi session
      if (vapi && vapi.start) {
        console.log('Starting Vapi session...');
        await vapi.start();
        console.log('Vapi session started successfully');
      } else {
        throw new Error('Vapi conversation not initialized. Please refresh the page and try again.');
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
      this.updateState({ 
        isConnected: false, 
        isListening: false, 
        error: error instanceof Error ? error.message : 'Failed to start conversation' 
      });
      throw error;
    }
  }

  // Stop conversation
  async stopConversation(): Promise<void> {
    try {
      console.log('ConversationService: Stopping conversation...');
      const vapi = (window as any).vapiConversation;
      if (vapi && vapi.stop) {
        vapi.stop();
      }
      
      // Immediately update state to reflect disconnection
      this.updateState({ isConnected: false, isListening: false, error: null });
      
      // DON'T add "Conversation ended" here - AppContext will handle it
      console.log('ConversationService: Conversation stopped, letting AppContext handle end message');
    } catch (error) {
      console.error('Failed to stop conversation:', error);
      // Still update state even if stop failed
      this.updateState({ isConnected: false, isListening: false, error: null });
    }
  }

  // Mute/unmute
  async toggleMute(): Promise<void> {
    const vapi = (window as any).vapiConversation;
    if (vapi && vapi.toggleMute) {
      const currentMuted = vapi.isMuted();
      vapi.toggleMute(!currentMuted);
    }
  }

  // Send a text message (for when voice isn't working)
  async sendTextMessage(text: string, learningMode: 'conversation' | 'blurting' | 'teaching' = 'conversation'): Promise<void> {
    if (!text.trim()) return;

    // Add user message first
    const userMessage = {
      speaker: 'user' as const,
      text,
      timestamp: new Date().toLocaleTimeString(),
      messageId: `msg_${Date.now()}_${Math.random()}`
    };
    
    this.addMessage(userMessage);

    try {
      // Call the chat API for an AI response
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: this.currentSessionMessages.slice(-10),
          learningMode,
          userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const aiResponse = data.response;

      // Add AI response directly - no streaming
      this.addMessage({
        speaker: 'ai',
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString(),
        messageId: `msg_${Date.now()}_${Math.random()}`
      });

    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback to a generic error message
      this.addMessage({
        speaker: 'ai',
        text: "I'm sorry, I'm having trouble responding right now. Could you try again?",
        timestamp: new Date().toLocaleTimeString(),
        messageId: `msg_${Date.now()}_${Math.random()}`
      });
    }
  }

  // Add a message and notify subscribers
  addMessage(message: ConversationMessage) {
    console.log('ConversationService: Adding message:', message);
    this.messages.push(message);
    this.currentSessionMessages.push(message); // Also add to current session messages
    console.log('ConversationService: Notifying', this.messageCallbacks.length, 'subscribers');
    this.messageCallbacks.forEach(callback => callback(message));
  }

  // Get current messages
  getMessages(): ConversationMessage[] {
    return [...this.messages];
  }

  // Handle automatic disconnection (e.g., from tab switching) without ending conversation
  handleAutomaticDisconnection(): void {
    console.log('Handling automatic disconnection - preserving conversation state');
    this.updateState({ isConnected: false, isListening: false });
    // Don't add "Conversation ended" message for automatic disconnections
  }

  isMicMuted(): boolean {
    return this.isMuted;
  }

  // Get connection status
  isConnectedToVoice(): boolean {
    const retell = (window as any).retellConversation;
    return retell?.status === 'connected' || false;
  }

  // Cleanup
  destroy() {
    this.messageCallbacks = [];
    this.stateCallbacks = [];
    this.messages = [];
    this.currentSessionMessages = [];
    this.isMuted = false;
  }
}

// Export singleton instance
export const conversationService = new ConversationService();

// Expose globally for Retell component
if (typeof window !== 'undefined') {
  (window as any).conversationService = conversationService;
} 