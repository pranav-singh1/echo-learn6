-- Fix voice minutes precision by changing usage_count from INTEGER to DECIMAL
-- This allows accurate tracking of decimal minutes instead of rounding to whole numbers

-- Change usage_count column to support decimal values
ALTER TABLE public.subscription_usage 
ALTER COLUMN usage_count TYPE DECIMAL(10,2) USING usage_count::DECIMAL(10,2);

-- Update any existing voice_minutes usage to be more precise if needed
-- (This is optional - existing data will be preserved as whole numbers)
UPDATE public.subscription_usage 
SET usage_count = usage_count::DECIMAL(10,2)
WHERE feature_name = 'voice_minutes';

-- Add a comment to document the change
COMMENT ON COLUMN public.subscription_usage.usage_count IS 'Usage count with decimal precision (e.g., 1.5 for 1 minute 30 seconds)';
