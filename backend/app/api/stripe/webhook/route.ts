import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  let event;

  try {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!endpointSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }
    event = stripe.webhooks.constructEvent(body, signature!, endpointSecret);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.log(`⚠️  Webhook signature verification failed.`, errorMessage);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object);
      break;
      
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
      
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
      
    case 'customer.subscription.trial_will_end':
      console.log(`Subscription trial ending: ${event.data.object.id}`);
      break;
      
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
      
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleSubscriptionCreated(subscription: any) {
  console.log(`Subscription created: ${subscription.id}`);
  
  if (!supabase) {
    console.error('Supabase not configured for webhook');
    return;
  }
  
  try {
    const customerId = subscription.customer;
    const priceId = subscription.items.data[0].price.id;
    
    const customer = await stripe.customers.retrieve(customerId);
    
    // Check if customer is deleted
    if (customer.deleted) {
      console.error('Customer is deleted:', customerId);
      return;
    }
    
    const email = customer.email;
    
    if (!email) {
      console.error('No email found for customer:', customerId);
      return;
    }
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (userError || !user) {
      console.error('User not found for email:', email);
      return;
    }
    
    const plan = getPlanFromPriceId(priceId);
    
    await supabase
      .from('users')
      .update({
        stripe_customer_id: customerId,
        subscription_id: subscription.id,
        subscription_status: subscription.status,
        subscription_plan: plan,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    console.log(`Updated user ${user.id} with subscription ${subscription.id}`);
    
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log(`Subscription updated: ${subscription.id}`);
  
  if (!supabase) {
    console.error('Supabase not configured for webhook');
    return;
  }
  
  try {
    const priceId = subscription.items.data[0].price.id;
    const plan = getPlanFromPriceId(priceId);
    
    await supabase
      .from('users')
      .update({
        subscription_status: subscription.status,
        subscription_plan: plan,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', subscription.id);
    
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  console.log(`Subscription deleted: ${subscription.id}`);
  
  if (!supabase) {
    console.error('Supabase not configured for webhook');
    return;
  }
  
  try {
    await supabase
      .from('users')
      .update({
        subscription_status: 'canceled',
        subscription_plan: 'free',
        subscription_id: null,
        current_period_start: null,
        current_period_end: null,
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', subscription.id);
    
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handlePaymentSucceeded(invoice: any) {
  console.log(`Payment succeeded for invoice: ${invoice.id}`);
  
  if (!supabase) {
    console.error('Supabase not configured for webhook');
    return;
  }
  
  try {
    await supabase
      .from('users')
      .update({
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', invoice.subscription);
    
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(invoice: any) {
  console.log(`Payment failed for invoice: ${invoice.id}`);
  
  if (!supabase) {
    console.error('Supabase not configured for webhook');
    return;
  }
  
  try {
    await supabase
      .from('users')
      .update({
        subscription_status: 'past_due',
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', invoice.subscription);
    
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

function getPlanFromPriceId(priceId: string): string {
  const priceToPlanMap: { [key: string]: string } = {
    'price_pro_monthly': 'pro',
    'price_pro_yearly': 'pro',
  };
  
  return priceToPlanMap[priceId] || 'free';
} 