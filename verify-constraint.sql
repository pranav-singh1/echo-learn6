-- Verify the learning_mode constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.conversations'::regclass 
AND conname = 'conversations_learning_mode_check';

-- If no results above, let's try to find any constraints on the learning_mode column
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.conversations'::regclass 
AND pg_get_constraintdef(oid) LIKE '%learning_mode%';

-- Show the current column definition
SELECT column_name, data_type, is_nullable, column_default, 
       CASE WHEN character_maximum_length IS NOT NULL 
            THEN character_maximum_length::text 
            ELSE '' 
       END as max_length
FROM information_schema.columns 
WHERE table_name = 'conversations' 
AND column_name = 'learning_mode'; 