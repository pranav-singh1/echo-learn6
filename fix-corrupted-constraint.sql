-- Drop the corrupted constraint
ALTER TABLE public.conversations DROP CONSTRAINT conversations_learning_mode_check;

-- Add the correct constraint with all three learning modes
ALTER TABLE public.conversations ADD CONSTRAINT conversations_learning_mode_check 
CHECK (learning_mode IN ('conversation', 'blurting', 'teaching'));

-- Verify the constraint was recreated properly
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.conversations'::regclass 
AND conname = 'conversations_learning_mode_check';

-- Test that 'teaching' is now valid by checking the constraint definition
SELECT 'Constraint should now allow: conversation, blurting, teaching' as verification; 