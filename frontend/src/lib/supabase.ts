import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          profile_picture: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          profile_picture?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          profile_picture?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          messages: any[];
          summary: string | null;
          quiz_questions: any[] | null;
          learning_mode: 'conversation' | 'blurting';
          blurt_content: string | null;
          blurt_feedback: any | null;
          blurt_completed: boolean | null;
          created_at: string;
          updated_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          messages?: any[];
          summary?: string | null;
          quiz_questions?: any[] | null;
          learning_mode?: 'conversation' | 'blurting';
          blurt_content?: string | null;
          blurt_feedback?: any | null;
          blurt_completed?: boolean | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          messages?: any[];
          summary?: string | null;
          quiz_questions?: any[] | null;
          learning_mode?: 'conversation' | 'blurting';
          blurt_content?: string | null;
          blurt_feedback?: any | null;
          blurt_completed?: boolean | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
        };
      };
    };
  };
}

// Typed Supabase client
export const typedSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey); 