import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SubscriptionService } from '../lib/subscription';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export const SubscriptionTest: React.FC = () => {
  const { user } = useAuth();
  const [userPlan, setUserPlan] = useState<string>('free');
  const [planLimits, setPlanLimits] = useState<any>(null);
  const [usage, setUsage] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionData();
  }, [user]);

  const loadSubscriptionData = async () => {
    if (!user) return;

    try {
      const plan = await SubscriptionService.getUserPlan();
      const limits = await SubscriptionService.getPlanLimits(plan);
      setUserPlan(plan);
      setPlanLimits(limits);

      // Load current usage
      const features = ['messages', 'quiz_generations', 'voice_minutes'];
      const usageData: any = {};

      for (const feature of features) {
        try {
          const usageInfo = await SubscriptionService.checkFeatureLimit(feature);
          usageData[feature] = usageInfo;
        } catch (error) {
          console.error(`Error loading usage for ${feature}:`, error);
        }
      }

      setUsage(usageData);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const testFeatureAccess = async (feature: string) => {
    try {
      const allowed = await SubscriptionService.checkFeatureLimit(feature);
      alert(`${feature} access: ${allowed.allowed ? 'Allowed' : 'Blocked'}\nReason: ${allowed.message}`);
    } catch (error) {
      alert(`Error testing ${feature}: ${error}`);
    }
  };

  if (loading) {
    return <div>Loading subscription data...</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Subscription Test</span>
          <Badge variant={userPlan === 'free' ? 'secondary' : 'default'}>
            {userPlan.toUpperCase()} PLAN
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {planLimits && (
          <div className="space-y-4">
            <h3 className="font-semibold">Plan Limits</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex justify-between">
                <span>Voice Minutes (Monthly):</span>
                <span>{planLimits.max_voice_minutes_per_month}</span>
              </div>
              <div className="flex justify-between">
                <span>Messages (Monthly):</span>
                <span>{planLimits.max_messages_per_month}</span>
              </div>
              <div className="flex justify-between">
                <span>Quiz Generations (Daily):</span>
                <span>{planLimits.max_quiz_generations_per_day}</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold">Current Usage</h3>
          {Object.entries(usage).map(([feature, usageInfo]: [string, any]) => (
            <div key={feature} className="flex justify-between items-center">
              <span className="capitalize">{feature.replace('_', ' ')}:</span>
              <span>{usageInfo.currentUsage} / {usageInfo.maxUsage}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Test Features</h3>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => testFeatureAccess('messages')} size="sm">
              Test Messages
            </Button>
            <Button onClick={() => testFeatureAccess('quiz_generations')} size="sm">
              Test Quiz
            </Button>
            <Button onClick={() => testFeatureAccess('voice_minutes')} size="sm">
              Test Voice
            </Button>
          </div>
        </div>

        <Button onClick={loadSubscriptionData} className="w-full">
          Refresh Data
        </Button>
      </CardContent>
    </Card>
  );
}; 