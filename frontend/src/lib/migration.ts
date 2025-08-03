import { supabase } from './supabase';

export async function runBlurtingMigration() {
  try {
    console.log('Running blurting migration...');
    
    // Add learning_mode column if it doesn't exist
    const { error: learningModeError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'conversations' AND column_name = 'learning_mode') THEN
            ALTER TABLE public.conversations ADD COLUMN learning_mode TEXT DEFAULT 'conversation' CHECK (learning_mode IN ('conversation', 'blurting'));
          END IF;
        END $$;
      `
    });

    if (learningModeError) {
      console.error('Error adding learning_mode column:', learningModeError);
    } else {
      console.log('learning_mode column added successfully');
    }

    // Add blurt_content column if it doesn't exist
    const { error: blurtContentError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'conversations' AND column_name = 'blurt_content') THEN
            ALTER TABLE public.conversations ADD COLUMN blurt_content TEXT;
          END IF;
        END $$;
      `
    });

    if (blurtContentError) {
      console.error('Error adding blurt_content column:', blurtContentError);
    } else {
      console.log('blurt_content column added successfully');
    }

    // Add blurt_feedback column if it doesn't exist
    const { error: blurtFeedbackError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'conversations' AND column_name = 'blurt_feedback') THEN
            ALTER TABLE public.conversations ADD COLUMN blurt_feedback JSONB DEFAULT '{}'::jsonb;
          END IF;
        END $$;
      `
    });

    if (blurtFeedbackError) {
      console.error('Error adding blurt_feedback column:', blurtFeedbackError);
    } else {
      console.log('blurt_feedback column added successfully');
    }

    // Add blurt_completed column if it doesn't exist
    const { error: blurtCompletedError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'conversations' AND column_name = 'blurt_completed') THEN
            ALTER TABLE public.conversations ADD COLUMN blurt_completed BOOLEAN DEFAULT false;
          END IF;
        END $$;
      `
    });

    if (blurtCompletedError) {
      console.error('Error adding blurt_completed column:', blurtCompletedError);
    } else {
      console.log('blurt_completed column added successfully');
    }

    // Add index for learning_mode if it doesn't exist
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_conversations_learning_mode ON public.conversations(learning_mode);
      `
    });

    if (indexError) {
      console.error('Error adding learning_mode index:', indexError);
    } else {
      console.log('learning_mode index added successfully');
    }

    console.log('Blurting migration completed successfully!');
    return true;
  } catch (error) {
    console.error('Error running blurting migration:', error);
    return false;
  }
} 