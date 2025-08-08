-- Add subscription columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'past_due', 'canceled', 'unpaid'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;

-- Create subscription_usage table
CREATE TABLE IF NOT EXISTS public.subscription_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    feature_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    reset_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, feature_name, reset_date)
);

-- Create plan_limits table
CREATE TABLE IF NOT EXISTS public.plan_limits (
    plan_name TEXT PRIMARY KEY,
    max_voice_minutes_per_month INTEGER DEFAULT 0,
    max_messages_per_month INTEGER DEFAULT 0,
    max_quiz_generations_per_day INTEGER DEFAULT 0,
    can_use_voice BOOLEAN DEFAULT false,
    can_use_quiz BOOLEAN DEFAULT false,
    can_use_summary BOOLEAN DEFAULT false,
    can_use_blurting BOOLEAN DEFAULT false,
    can_use_teaching BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default plan limits
INSERT INTO public.plan_limits (plan_name, max_voice_minutes_per_month, max_messages_per_month, max_quiz_generations_per_day, can_use_voice, can_use_quiz, can_use_summary, can_use_blurting, can_use_teaching) VALUES
('free', 50, 300, 3, true, true, true, true, true),
('pro', 150, 900, 10, true, true, true, true, true)
ON CONFLICT (plan_name) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_id ON public.subscription_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_feature ON public.subscription_usage(feature_name);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON public.users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_subscription_plan ON public.users(subscription_plan);

-- Enable RLS
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own usage" ON public.subscription_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own usage" ON public.subscription_usage FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON public.subscription_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can view plan limits" ON public.plan_limits FOR SELECT USING (true); 