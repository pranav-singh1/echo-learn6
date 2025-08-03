// Supabase-based conversation storage and management system
import { supabase } from './supabase';
import { ConversationMessage } from '../components/ElevenLabsConversation';

export interface ConversationSession {
  id: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
  summary?: string;
  quizQuestions?: any[];
  quizAnswers?: { [key: number]: string };
  quizEvaluations?: { [key: number]: any };
  quizShowAnswers?: boolean;
  learningMode: 'conversation' | 'blurting';
  blurtContent?: string;
  blurtFeedback?: any;
  isBlurtCompleted?: boolean;
  isActive: boolean;
}

export interface ConversationStorage {
  sessions: ConversationSession[];
  activeSessionId: string | null;
}

class SupabaseConversationStorageService {
  private maxSessions = 50; // Limit to prevent storage bloat

  // Get all conversations from Supabase for current user
  async getConversations(): Promise<ConversationStorage> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { sessions: [], activeSessionId: null };
      }

      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading conversations:', error);
        return { sessions: [], activeSessionId: null };
      }

      const sessions: ConversationSession[] = conversations.map(conv => ({
        id: conv.id,
        title: conv.title,
        messages: conv.messages || [],
        createdAt: conv.created_at,
        updatedAt: conv.updated_at,
        summary: conv.summary,
        quizQuestions: conv.quiz_questions || [],
        quizAnswers: conv.quiz_answers || {},
        quizEvaluations: conv.quiz_evaluations || {},
        quizShowAnswers: conv.quiz_show_answers,
        learningMode: conv.learning_mode || 'conversation',
        blurtContent: conv.blurt_content,
        blurtFeedback: conv.blurt_feedback,
        isBlurtCompleted: conv.blurt_completed,
        isActive: conv.is_active
      }));

      const activeSession = sessions.find(s => s.isActive);
      
      return {
        sessions,
        activeSessionId: activeSession?.id || null
      };
    } catch (error) {
      console.error('Error loading conversations:', error);
      return { sessions: [], activeSessionId: null };
    }
  }

  // Create a new conversation session
  async createSession(title?: string, learningMode: 'conversation' | 'blurting' = 'conversation'): Promise<ConversationSession> {
    console.log('createSession called with title:', title);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
      if (!user) {
        console.log('No user found, throwing error');
        throw new Error('No user logged in');
      }

      console.log('Deactivating all other sessions...');
      // Deactivate all other sessions
      const { error: deactivateError } = await supabase
        .from('conversations')
        .update({ is_active: false })
        .eq('user_id', user.id);

      if (deactivateError) {
        console.error('Error deactivating sessions:', deactivateError);
      }

      console.log('Inserting new session into Supabase...');
      // Insert into Supabase (let Supabase generate the UUID)
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: title || 'New Conversation',
          messages: [],
          learning_mode: learningMode,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating session in Supabase:', error);
        throw error;
      }

      console.log('Session created successfully in Supabase:', data);
      
      // Convert the Supabase response to our ConversationSession format
      const newSession: ConversationSession = {
        id: data.id,
        title: data.title,
        messages: data.messages || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        isActive: data.is_active,
        learningMode: data.learning_mode || 'conversation',
        blurtContent: data.blurt_content,
        blurtFeedback: data.blurt_feedback,
        isBlurtCompleted: data.blurt_completed,
        quizAnswers: data.quiz_answers || {},
        quizEvaluations: data.quiz_evaluations || {},
        quizShowAnswers: data.quiz_show_answers
      };

      return newSession;
    } catch (error) {
      console.error('Error in createSession:', error);
      throw error;
    }
  }

  // Get the active session
  async getActiveSession(): Promise<ConversationSession | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error || !conversations) {
        return null;
      }

      return {
        id: conversations.id,
        title: conversations.title,
        messages: conversations.messages || [],
        createdAt: conversations.created_at,
        updatedAt: conversations.updated_at,
        summary: conversations.summary,
        quizQuestions: conversations.quiz_questions || [],
        quizAnswers: conversations.quiz_answers || {},
        quizEvaluations: conversations.quiz_evaluations || {},
        quizShowAnswers: conversations.quiz_show_answers,
        isActive: conversations.is_active,
        learningMode: conversations.learning_mode || 'conversation',
        blurtContent: conversations.blurt_content,
        blurtFeedback: conversations.blurt_feedback,
        isBlurtCompleted: conversations.blurt_completed
      };
    } catch (error) {
      console.error('Error getting active session:', error);
      return null;
    }
  }

  // Get a specific session by ID
  async getSession(sessionId: string): Promise<ConversationSession | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: conversation, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (error || !conversation) {
        return null;
      }

      return {
        id: conversation.id,
        title: conversation.title,
        messages: conversation.messages || [],
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at,
        summary: conversation.summary,
        quizQuestions: conversation.quiz_questions || [],
        quizAnswers: conversation.quiz_answers || {},
        quizEvaluations: conversation.quiz_evaluations || {},
        quizShowAnswers: conversation.quiz_show_answers,
        isActive: conversation.is_active,
        learningMode: conversation.learning_mode || 'conversation',
        blurtContent: conversation.blurt_content,
        blurtFeedback: conversation.blurt_feedback,
        isBlurtCompleted: conversation.blurt_completed
      };
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  // Add a message to the active session
  async addMessage(message: ConversationMessage, sessionId?: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let targetSessionId = sessionId;
      
      // If no sessionId provided, try to get the active session
      if (!targetSessionId) {
        const activeSession = await this.getActiveSession();
        if (!activeSession) {
          console.warn('No active session found, cannot save message');
          return;
        }
        targetSessionId = activeSession.id;
      }

      // Get the current session to update messages
      const session = await this.getSession(targetSessionId);
      if (!session) {
        console.error('Session not found:', targetSessionId);
        return;
      }

      const updatedMessages = [...session.messages, message];
      
      // Auto-generate title from first user message if it's still default
      let updatedTitle = session.title;
      if (session.title.startsWith('Conversation ') && message.speaker === 'user') {
        const words = message.text.split(' ').slice(0, 5).join(' ');
        updatedTitle = words.length > 20 ? words.substring(0, 20) + '...' : words;
      }

      const { error } = await supabase
        .from('conversations')
        .update({
          messages: updatedMessages,
          title: updatedTitle,
          updated_at: new Date().toISOString()
        })
        .eq('id', targetSessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error adding message:', error);
      }
    } catch (error) {
      console.error('Error adding message:', error);
    }
  }

  // Update session metadata (summary, quiz questions, etc.)
  async updateSession(sessionId: string, updates: Partial<ConversationSession>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.messages !== undefined) updateData.messages = updates.messages;
      if (updates.summary !== undefined) updateData.summary = updates.summary;
      if (updates.quizQuestions !== undefined) updateData.quiz_questions = updates.quizQuestions;
      if (updates.quizAnswers !== undefined) updateData.quiz_answers = updates.quizAnswers;
      if (updates.quizEvaluations !== undefined) updateData.quiz_evaluations = updates.quizEvaluations;
      if (updates.quizShowAnswers !== undefined) updateData.quiz_show_answers = updates.quizShowAnswers;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      if (updates.blurtContent !== undefined) updateData.blurt_content = updates.blurtContent;
      if (updates.blurtFeedback !== undefined) updateData.blurt_feedback = updates.blurtFeedback;
      if (updates.isBlurtCompleted !== undefined) updateData.blurt_completed = updates.isBlurtCompleted;

      const { error } = await supabase
        .from('conversations')
        .update(updateData)
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating session:', error);
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
  }

  // Switch to a different session
  async switchToSession(sessionId: string): Promise<ConversationSession | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Deactivate all sessions
      await supabase
        .from('conversations')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Activate target session
      const { error } = await supabase
        .from('conversations')
        .update({ is_active: true })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error switching session:', error);
        return null;
      }

      return await this.getSession(sessionId);
    } catch (error) {
      console.error('Error switching session:', error);
      return null;
    }
  }

  // Delete a session
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting session:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  // Get all sessions for display
  async getAllSessions(): Promise<ConversationSession[]> {
    const storage = await this.getConversations();
    return storage.sessions;
  }

  // Clear all conversations
  async clearAllConversations(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing conversations:', error);
      }
    } catch (error) {
      console.error('Error clearing conversations:', error);
    }
  }
}

export const supabaseConversationStorage = new SupabaseConversationStorageService(); 