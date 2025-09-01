import React, { useState, useEffect } from 'react';
import { SubscriptionService } from '../lib/subscription';
import { useAuth } from '../contexts/AuthContext';

interface UsageLimitsDisplayProps {
  showRefreshButton?: boolean;
  className?: string;
  compact?: boolean;
}

export const UsageLimitsDisplay: React.FC<UsageLimitsDisplayProps> = ({
  showRefreshButton = true,
  className = '',
  compact = false
}) => {
  const { user } = useAuth();
  const [usageData, setUsageData] = useState<{
    voice: { current: number; max: number } | null;
    messages: { current: number; max: number } | null;
    quizzes: { current: number; max: number } | null;
  }>({
    voice: null,
    messages: null,
    quizzes: null
  });
  const [loadingUsage, setLoadingUsage] = useState(false);

  const loadUsageData = async () => {
    if (!user?.id) return;
    
    setLoadingUsage(true);
    try {
      const [voiceUsage, messagesUsage, quizzesUsage] = await Promise.all([
        SubscriptionService.checkFeatureLimit('voice_minutes'),
        SubscriptionService.checkFeatureLimit('messages'),
        SubscriptionService.checkFeatureLimit('quiz_generations')
      ]);

      setUsageData({
        voice: {
          current: voiceUsage.currentUsage,
          max: typeof voiceUsage.maxUsage === 'number' ? voiceUsage.maxUsage : 0
        },
        messages: {
          current: messagesUsage.currentUsage,
          max: typeof messagesUsage.maxUsage === 'number' ? messagesUsage.maxUsage : 0
        },
        quizzes: {
          current: quizzesUsage.currentUsage,
          max: typeof quizzesUsage.maxUsage === 'number' ? quizzesUsage.maxUsage : 0
        }
      });
    } catch (error) {
      console.error('Error loading usage data:', error);
    } finally {
      setLoadingUsage(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadUsageData();
    }
  }, [user?.id]);

  const getUsageColor = (current: number, max: number) => {
    if (current >= max) return 'text-red-500';
    if (current >= max * 0.8) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (loadingUsage) {
    return (
      <div className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>
        Loading usage data...
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`text-xs space-y-1 ${className}`}>
        {usageData.voice && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Voice:</span>
            <span className={getUsageColor(usageData.voice.current, usageData.voice.max)}>
              {usageData.voice.current}/{usageData.voice.max}
            </span>
          </div>
        )}
        {usageData.messages && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Messages:</span>
            <span className={getUsageColor(usageData.messages.current, usageData.messages.max)}>
              {usageData.messages.current}/{usageData.messages.max}
            </span>
          </div>
        )}
        {usageData.quizzes && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Quizzes:</span>
            <span className={getUsageColor(usageData.quizzes.current, usageData.quizzes.max)}>
              {usageData.quizzes.current}/{usageData.quizzes.max}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Usage Limits
        </h3>
        {showRefreshButton && (
          <button
            onClick={loadUsageData}
            disabled={loadingUsage}
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingUsage ? 'Refreshing...' : 'Refresh'}
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {/* Voice Minutes */}
        {usageData.voice && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Voice Minutes (Monthly)
            </span>
            <span className={`text-sm font-medium ${getUsageColor(usageData.voice.current, usageData.voice.max)}`}>
              {usageData.voice.current}/{usageData.voice.max}
            </span>
          </div>
        )}
        
        {/* Messages */}
        {usageData.messages && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Chat Messages (Monthly)
            </span>
            <span className={`text-sm font-medium ${getUsageColor(usageData.messages.current, usageData.messages.max)}`}>
              {usageData.messages.current}/{usageData.messages.max}
            </span>
          </div>
        )}
        
        {/* Quizzes */}
        {usageData.quizzes && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Quiz Generations (Daily)
            </span>
            <span className={`text-sm font-medium ${getUsageColor(usageData.quizzes.current, usageData.quizzes.max)}`}>
              {usageData.quizzes.current}/{usageData.quizzes.max}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
