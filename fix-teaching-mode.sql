-- Fix the learning_mode enum constraint to include 'teaching'
-- This script updates the existing constraint to allow 'teaching' mode

-- First, drop the existing constraint (if it exists)
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_learning_mode_check;

-- Add the new constraint that includes 'teaching'
ALTER TABLE public.conversations ADD CONSTRAINT conversations_learning_mode_check 
CHECK (learning_mode IN ('conversation', 'blurting', 'teaching'));

-- Also update the default value to ensure it's set correctly
ALTER TABLE public.conversations ALTER COLUMN learning_mode SET DEFAULT 'conversation';

-- Verify the constraint was applied
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.conversations'::regclass 
AND conname = 'conversations_learning_mode_check';

-- Show current learning_mode values in the database
SELECT id, learning_mode FROM public.conversations ORDER BY created_at DESC LIMIT 5; 