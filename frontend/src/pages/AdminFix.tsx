import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { supabase } from '../lib/supabase';

export const AdminFix: React.FC = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<string>('');

  const fixSubscription = async () => {
    setIsFixing(true);
    setResult('');
    
    try {
      // Get the current session to include the access token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        setResult('❌ Not logged in');
        setIsFixing(false);
        return;
      }

      const response = await fetch('/api/stripe/fix-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: 'pranavsingh2006@gmail.com'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult('✅ Subscription fixed! Refreshing page...');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setResult('❌ Fix failed: ' + data.error);
      }
    } catch (error) {
      setResult('❌ Error: ' + (error as Error).message);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Subscription Fix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Click the button below to fix your subscription status.
          </p>
          
          <Button
            onClick={fixSubscription}
            disabled={isFixing}
            className="w-full"
          >
            {isFixing ? 'Fixing...' : 'Fix My Subscription'}
          </Button>
          
          {result && (
            <div className="p-3 rounded-lg bg-gray-100 text-sm">
              {result}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
