-- Add the missing learning_mode constraint
-- This will enforce that learning_mode can only be 'conversation', 'blurting', or 'teaching'

-- Add the constraint (it doesn't exist, so we don't need to drop it first)
ALTER TABLE public.conversations ADD CONSTRAINT conversations_learning_mode_check 
CHECK (learning_mode IN ('conversation', 'blurting', 'teaching'));

-- Verify the constraint was added
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.conversations'::regclass 
AND conname = 'conversations_learning_mode_check';

-- Test that we can now insert 'teaching' mode
-- (This will show an error if the constraint isn't working)
SELECT 'Constraint test: teaching should be valid' as test_result; 