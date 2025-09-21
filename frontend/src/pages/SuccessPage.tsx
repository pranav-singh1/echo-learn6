import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CheckCircle, ArrowRight, Settings, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const SuccessPage: React.FC = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string>('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get session ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdParam = urlParams.get('session_id');
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
      // Automatically verify the session when we have a session ID
      verifySession(sessionIdParam);
    }
  }, []);

  // Force light mode by removing dark class and adding light class to document
  useEffect(() => {
    const originalClass = document.documentElement.className;
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    
    // Cleanup: restore original classes when component unmounts
    return () => {
      document.documentElement.className = originalClass;
    };
  }, []);

  const verifySession = async (sessionId: string) => {
    setIsVerifying(true);
    setVerificationError('');
    
    try {
      // Get the current session to include the access token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        setVerificationError('Authentication required. Please log in and try again.');
        setIsVerifying(false);
        return;
      }

      const response = await fetch('/api/stripe/verify-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          session_id: sessionId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to verify subscription');
      }

      setVerificationSuccess(true);
      console.log('Subscription verified successfully:', result);
    } catch (error) {
      console.error('Error verifying subscription:', error);
      setVerificationError(error instanceof Error ? error.message : 'Failed to verify subscription');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        console.error('Error creating portal session:', error);
        alert('Failed to open billing portal. Please try again.');
        return;
      }

      // Redirect to Stripe Customer Portal
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome to EchoLearn Pro!
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Your subscription has been activated successfully.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Verification Status */}
          {isVerifying && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <div>
                <h3 className="font-semibold text-blue-800">Activating Your Subscription</h3>
                <p className="text-sm text-blue-700">Please wait while we set up your account...</p>
              </div>
            </div>
          )}

          {verificationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800">Activation Issue</h3>
                  <p className="text-sm text-red-700 mt-1">{verificationError}</p>
                  <Button
                    onClick={() => sessionId && verifySession(sessionId)}
                    variant="outline"
                    size="sm"
                    className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          )}

          {verificationSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Subscription Activated!</h3>
                  <p className="text-sm text-green-700">Your EchoLearn Pro features are now ready to use.</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">
              What's Next?
            </h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Start unlimited conversations with EchoLearn</li>
              <li>• Explore all learning modes (Conversation, Blurting, Teaching)</li>
              <li>• Try voice chat for hands-free learning</li>
              <li>• Generate quizzes to test your knowledge</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Start Learning
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {sessionId && (
              <Button
                onClick={handleManageBilling}
                variant="outline"
                className="w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Billing
              </Button>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Need help? Contact us at tryecholearn@gmail.com
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 