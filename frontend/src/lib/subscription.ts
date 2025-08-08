import { supabase } from './supabase';

export interface PlanLimits {
  max_voice_minutes_per_month: number;
  max_messages_per_month: number;
  max_quiz_generations_per_day: number;
  can_use_voice: boolean;
  can_use_quiz: boolean;
  can_use_summary: boolean;
  can_use_blurting: boolean;
  can_use_teaching: boolean;
}

export interface UsageInfo {
  allowed: boolean;
  currentUsage: number;
  maxUsage: number | 'unlimited';
  plan: string;
  reason: string;
  message: string;
}

export class SubscriptionService {
  static async checkFeatureLimit(feature: string): Promise<UsageInfo> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/subscription/check-limits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        feature,
        userId: user.id,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to check limits');
    }

    return response.json();
  }

  static async incrementUsage(feature: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/subscription/increment-usage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        feature,
        userId: user.id,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to increment usage');
    }
  }

  static async getUserPlan(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return 'free';
    }

    const { data, error } = await supabase
      .from('users')
      .select('subscription_plan')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      return 'free';
    }

    return data.subscription_plan || 'free';
  }

  static async getPlanLimits(plan: string): Promise<PlanLimits | null> {
    const { data, error } = await supabase
      .from('plan_limits')
      .select('*')
      .eq('plan_name', plan)
      .single();

    if (error || !data) {
      return null;
    }

    return data as PlanLimits;
  }

  static async getUserSubscriptionInfo() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('subscription_plan, subscription_status, current_period_end')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }
} 