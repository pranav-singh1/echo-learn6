-- Check ALL constraints on the conversations table
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.conversations'::regclass
ORDER BY conname;

-- Check if there are any constraints that mention 'learning_mode' (case insensitive)
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.conversations'::regclass 
AND (pg_get_constraintdef(oid) ILIKE '%learning_mode%' OR conname ILIKE '%learning_mode%');

-- Check the exact constraint that's causing the error
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.conversations'::regclass 
AND conname = 'conversations_learning_mode_check'; 