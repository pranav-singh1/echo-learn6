// Conversation storage and management system
import { ConversationMessage } from '../components/VapiConversation';

export interface ConversationSession {
  id: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
  summary?: string;
  quizQuestions?: any[];
  isActive: boolean;
}

export interface ConversationStorage {
  sessions: ConversationSession[];
  activeSessionId: string | null;
}

class ConversationStorageService {
  private storageKey = 'echolearn_conversations';
  private maxSessions = 50; // Limit to prevent storage bloat

  // Get all conversations from localStorage
  getConversations(): ConversationStorage {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
    
    return {
      sessions: [],
      activeSessionId: null
    };
  }

  // Save conversations to localStorage
  private saveConversations(data: ConversationStorage): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  }

  // Create a new conversation session
  createSession(title?: string): ConversationSession {
    const storage = this.getConversations();
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newSession: ConversationSession = {
      id: sessionId,
      title: title || `Conversation ${storage.sessions.length + 1}`,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    // Deactivate all other sessions
    storage.sessions.forEach(session => {
      session.isActive = false;
    });

    // Add new session and set as active
    storage.sessions.unshift(newSession);
    storage.activeSessionId = sessionId;

    // Limit the number of stored sessions
    if (storage.sessions.length > this.maxSessions) {
      storage.sessions = storage.sessions.slice(0, this.maxSessions);
    }

    this.saveConversations(storage);
    return newSession;
  }

  // Get the active session
  getActiveSession(): ConversationSession | null {
    const storage = this.getConversations();
    return storage.sessions.find(session => session.id === storage.activeSessionId) || null;
  }

  // Get a specific session by ID
  getSession(sessionId: string): ConversationSession | null {
    const storage = this.getConversations();
    return storage.sessions.find(session => session.id === sessionId) || null;
  }

  // Add a message to the active session
  addMessage(message: ConversationMessage): void {
    const storage = this.getConversations();
    const activeSession = storage.sessions.find(session => session.id === storage.activeSessionId);
    
    if (activeSession) {
      activeSession.messages.push(message);
      activeSession.updatedAt = new Date().toISOString();
      
      // Auto-generate title from first user message if it's still default
      if (activeSession.title.startsWith('Conversation ') && message.speaker === 'user') {
        const words = message.text.split(' ').slice(0, 5).join(' ');
        activeSession.title = words.length > 20 ? words.substring(0, 20) + '...' : words;
      }
      
      this.saveConversations(storage);
    }
  }

  // Update session metadata (summary, quiz questions, etc.)
  updateSession(sessionId: string, updates: Partial<ConversationSession>): void {
    const storage = this.getConversations();
    const session = storage.sessions.find(s => s.id === sessionId);
    
    if (session) {
      Object.assign(session, updates);
      session.updatedAt = new Date().toISOString();
      this.saveConversations(storage);
    }
  }

  // Switch to a different session
  switchToSession(sessionId: string): ConversationSession | null {
    const storage = this.getConversations();
    const targetSession = storage.sessions.find(session => session.id === sessionId);
    
    if (targetSession) {
      // Deactivate all sessions
      storage.sessions.forEach(session => {
        session.isActive = false;
      });
      
      // Activate target session
      targetSession.isActive = true;
      storage.activeSessionId = sessionId;
      
      this.saveConversations(storage);
      return targetSession;
    }
    
    return null;
  }

  // Delete a session
  deleteSession(sessionId: string): boolean {
    const storage = this.getConversations();
    const sessionIndex = storage.sessions.findIndex(session => session.id === sessionId);
    
    if (sessionIndex !== -1) {
      storage.sessions.splice(sessionIndex, 1);
      
      // If we deleted the active session, set the first session as active
      if (storage.activeSessionId === sessionId) {
        storage.activeSessionId = storage.sessions.length > 0 ? storage.sessions[0].id : null;
        if (storage.activeSessionId) {
          storage.sessions[0].isActive = true;
        }
      }
      
      this.saveConversations(storage);
      return true;
    }
    
    return false;
  }

  // Get all sessions for display
  getAllSessions(): ConversationSession[] {
    const storage = this.getConversations();
    return storage.sessions;
  }

  // Clear all conversations
  clearAllConversations(): void {
    this.saveConversations({
      sessions: [],
      activeSessionId: null
    });
  }

  // Export conversations (for backup)
  exportConversations(): string {
    const storage = this.getConversations();
    return JSON.stringify(storage, null, 2);
  }

  // Import conversations (for restore)
  importConversations(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (parsed.sessions && Array.isArray(parsed.sessions)) {
        this.saveConversations(parsed);
        return true;
      }
    } catch (error) {
      console.error('Error importing conversations:', error);
    }
    return false;
  }
}

// Create singleton instance
export const conversationStorage = new ConversationStorageService(); 