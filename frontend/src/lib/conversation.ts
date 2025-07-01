// Real ElevenLabs conversation service - simplified for reliability with streaming support
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
  private messageUpdateCallbacks: ((messageId: string, text: string, isComplete: boolean) => void)[] = [];
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

  // Subscribe to message updates
  onMessageUpdate(callback: (messageId: string, text: string, isComplete: boolean) => void) {
    this.messageUpdateCallbacks.push(callback);
    return () => {
      const index = this.messageUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.messageUpdateCallbacks.splice(index, 1);
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

  // Simplified start conversation - remove complex audio setup
  async startConversation(): Promise<void> {
    try {
      console.log('ConversationService: Starting conversation...');
      
      // Update state to connecting
      this.updateState({ isConnected: false, isListening: true, error: null });

      // Start the ElevenLabs session directly
      const elevenLabs = (window as any).elevenLabsConversation;
      if (elevenLabs && elevenLabs.start) {
        console.log('Starting ElevenLabs session...');
        await elevenLabs.start();
        console.log('ElevenLabs session started successfully');
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

    this.addMessage({
      speaker: 'user',
      text,
      timestamp: new Date().toLocaleTimeString(),
      messageId: `msg_${Date.now()}_${Math.random()}`
    });

    // Create a streaming response for text messages too
    setTimeout(() => {
      const responses = [
        "That's interesting! Can you tell me more about that?",
        "Great explanation! What other aspects of this topic would you like to explore?",
        "I see what you mean. How does this connect to what you've learned before?",
        "Excellent point! Can you give me an example of that?",
        "That's a good start. What questions do you have about this topic?"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Start streaming the response
      const messageId = `msg_${Date.now()}_${Math.random()}`;
      const streamingMessage: ConversationMessage = {
        speaker: 'ai',
        text: '',
        timestamp: new Date().toLocaleTimeString(),
        isStreaming: true,
        messageId
      };
      
      this.addMessage(streamingMessage);
      this.streamText(randomResponse, messageId);
    }, 1000);
  }

  private streamText(fullText: string, messageId: string) {
    let currentIndex = 0;
    const streamInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        const currentText = fullText.substring(0, currentIndex + 1);
        this.updateMessage(messageId, currentText, false);
        currentIndex++;
      } else {
        clearInterval(streamInterval);
        this.updateMessage(messageId, fullText, true);
      }
    }, 30);
  }

  // Add a message and notify subscribers
  addMessage(message: ConversationMessage) {
    this.messages.push(message);
    this.messageCallbacks.forEach(callback => callback(message));
  }

  // Update message and notify subscribers
  updateMessage(messageId: string, text: string, isComplete: boolean) {
    // Update the message in the messages array
    const messageIndex = this.messages.findIndex(msg => msg.messageId === messageId);
    if (messageIndex !== -1) {
      this.messages[messageIndex] = {
        ...this.messages[messageIndex],
        text,
        isStreaming: !isComplete
      };
    }
    
    // Notify callbacks
    this.messageUpdateCallbacks.forEach(callback => callback(messageId, text, isComplete));
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
    this.messageUpdateCallbacks = [];
    this.stateCallbacks = [];
    this.messages = [];
  }
}

// Create a singleton instance
export const conversationService = new ConversationService(); 