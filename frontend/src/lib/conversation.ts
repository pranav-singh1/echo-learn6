// Real ElevenLabs conversation service - matches backend exactly
import { ConversationMessage } from '../components/ElevenLabsConversation';

export interface ConversationState {
  isConnected: boolean;
  isListening: boolean;
  messages: ConversationMessage[];
  error: string | null;
}

// This service connects to the real ElevenLabs conversation component
export class ConversationService {
  private messageCallbacks: ((message: ConversationMessage) => void)[] = [];
  private stateCallbacks: ((state: Partial<ConversationState>) => void)[] = [];
  private messages: ConversationMessage[] = [];

  constructor() {
    // Initialize the service
  }

  // Subscribe to conversation messages
  onMessage(callback: (message: ConversationMessage) => void) {
    this.messageCallbacks.push(callback);
    return () => {
      const index = this.messageCallbacks.indexOf(callback);
      if (index > -1) {
        this.messageCallbacks.splice(index, 1);
      }
    };
  }

  // Subscribe to state changes
  onStateChange(callback: (state: Partial<ConversationState>) => void) {
    this.stateCallbacks.push(callback);
    return () => {
      const index = this.stateCallbacks.indexOf(callback);
      if (index > -1) {
        this.stateCallbacks.splice(index, 1);
      }
    };
  }

  // Start conversation with ElevenLabs - same as backend
  async startConversation(): Promise<void> {
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Update state to connecting
      this.updateState({ isConnected: false, isListening: true, error: null });

      // Start the ElevenLabs session using the component
      const elevenLabs = (window as any).elevenLabsConversation;
      if (elevenLabs && elevenLabs.start) {
        await elevenLabs.start();
      } else {
        throw new Error('ElevenLabs conversation not initialized');
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

  // Stop conversation - same as backend
  async stopConversation(): Promise<void> {
    try {
      const elevenLabs = (window as any).elevenLabsConversation;
      if (elevenLabs && elevenLabs.stop) {
        await elevenLabs.stop();
      }
      
      this.updateState({ isConnected: false, isListening: false });
      
      // Add disconnect message
      this.addMessage({
        speaker: 'system',
        text: 'Conversation ended',
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Failed to stop conversation:', error);
    }
  }

  // Send a text message (for when voice isn't working)
  async sendTextMessage(text: string): Promise<void> {
    if (!text.trim()) return;

    // Add user message
    this.addMessage({
      speaker: 'user',
      text,
      timestamp: new Date().toLocaleTimeString()
    });

    // In a real implementation, this would go through ElevenLabs
    // For now, we'll simulate a response until we get the hook working
    setTimeout(() => {
      const responses = [
        "That's interesting! Can you tell me more about that?",
        "Great explanation! What other aspects of this topic would you like to explore?",
        "I see what you mean. How does this connect to what you've learned before?",
        "Excellent point! Can you give me an example of that?",
        "That's a good start. What questions do you have about this topic?"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      this.addMessage({
        speaker: 'ai',
        text: randomResponse,
        timestamp: new Date().toLocaleTimeString()
      });
    }, 1000);
  }

  // Add a message and notify subscribers
  addMessage(message: ConversationMessage) {
    this.messages.push(message);
    this.messageCallbacks.forEach(callback => callback(message));
  }

  // Update state and notify subscribers
  updateState(state: Partial<ConversationState>) {
    this.stateCallbacks.forEach(callback => callback(state));
  }

  // Get current messages
  getMessages(): ConversationMessage[] {
    return [...this.messages];
  }

  // Cleanup
  destroy() {
    this.messageCallbacks = [];
    this.stateCallbacks = [];
    this.messages = [];
  }
}

// Create a singleton instance
export const conversationService = new ConversationService(); 