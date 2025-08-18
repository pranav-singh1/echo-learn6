import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Check, Sparkles, Zap, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  lookup_key: string;
  popular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'monthly',
    name: 'EchoLearn Pro Monthly',
    price: '$9.99',
    period: 'per month',
    description: 'Perfect for getting started with AI-powered learning',
    features: [
      'Unlimited conversations with EchoLearn',
      'All learning modes (Conversation, Blurting, Teaching)',
      'Voice chat capabilities',
      'Quiz generation and assessment',
      'Conversation history and search',
      'Priority support',
    ],
    lookup_key: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
  },
  {
    id: 'yearly',
    name: 'EchoLearn Pro Yearly',
    price: '$89.99',
    period: 'per year',
    description: 'Best value for serious learners',
    features: [
      'Everything in Monthly plan',
      '2 months free (save $20)',
      'Early access to new features',
      'Advanced analytics and insights',
      'Custom learning paths',
      'Premium support',
    ],
    lookup_key: import.meta.env.VITE_STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
    popular: true,
  },
];

export const StripePricing: React.FC = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = async (plan: PricingPlan) => {
    // Check if user is authenticated
    if (!user) {
      navigate('/auth');
      return;
    }

    setIsLoading(plan.id);
    
    try {
      // Get the current session to include the access token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        alert('Authentication expired. Please log in again.');
        navigate('/auth');
        return;
      }

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          lookup_key: plan.lookup_key,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        if (response.status === 401) {
          alert('Please log in to subscribe to a plan.');
          navigate('/auth');
          return;
        }
        throw new Error(error || 'Failed to create checkout session');
      }

      const { url, error } = await response.json();

      if (error) {
        console.error('Error creating checkout session:', error);
        alert('Failed to create checkout session. Please try again.');
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your EchoLearn Plan
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Unlock the full potential of AI-powered learning
        </p>
        
        {!user && (
          <Alert className="mt-6 max-w-2xl mx-auto border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
            <LogIn className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-300">
              You need to <button 
                onClick={() => navigate('/auth')} 
                className="font-semibold underline hover:no-underline"
              >
                log in
              </button> before you can subscribe to a plan.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {pricingPlans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${
              plan.popular 
                ? 'border-2 border-blue-500 shadow-lg scale-105' 
                : 'border border-gray-200 dark:border-gray-700'
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {plan.name}
              </CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {plan.price}
                </span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">
                  {plan.period}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {plan.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(plan)}
                disabled={isLoading === plan.id}
                className={`w-full py-3 text-lg font-semibold ${
                  plan.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
                }`}
              >
                {isLoading === plan.id ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : !user ? (
                  <div className="flex items-center">
                    <LogIn className="w-4 h-4 mr-2" />
                    Log in to Subscribe
                  </div>
                ) : (
                  `Subscribe to ${plan.name}`
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Secure payment powered by Stripe. Cancel anytime.
        </p>
      </div>
    </div>
  );
}; 