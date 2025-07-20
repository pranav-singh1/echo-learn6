-- Migration: Add quiz answer persistence columns and profile picture
-- This script only adds the new quiz columns and profile picture to existing tables
-- Safe to run multiple times - won't create duplicates

-- Add new quiz columns to existing tables (safe to run multiple times)
DO $$ 
BEGIN
    -- Add quiz_answers column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'conversations' AND column_name = 'quiz_answers') THEN
        ALTER TABLE public.conversations ADD COLUMN quiz_answers JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Added quiz_answers column';
    ELSE
        RAISE NOTICE 'quiz_answers column already exists';
    END IF;
    
    -- Add quiz_evaluations column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'conversations' AND column_name = 'quiz_evaluations') THEN
        ALTER TABLE public.conversations ADD COLUMN quiz_evaluations JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Added quiz_evaluations column';
    ELSE
        RAISE NOTICE 'quiz_evaluations column already exists';
    END IF;
    
    -- Add quiz_show_answers column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'conversations' AND column_name = 'quiz_show_answers') THEN
        ALTER TABLE public.conversations ADD COLUMN quiz_show_answers BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added quiz_show_answers column';
    ELSE
        RAISE NOTICE 'quiz_show_answers column already exists';
    END IF;
    
    -- Add profile_picture column to users table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'profile_picture') THEN
        ALTER TABLE public.users ADD COLUMN profile_picture TEXT;
        RAISE NOTICE 'Added profile_picture column';
    ELSE
        RAISE NOTICE 'profile_picture column already exists';
    END IF;
END $$;

-- Verify the migration
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'conversations' 
    AND column_name IN ('quiz_answers', 'quiz_evaluations', 'quiz_show_answers')
UNION ALL
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND column_name = 'profile_picture'
ORDER BY column_name; 