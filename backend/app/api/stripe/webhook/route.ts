import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  let event;

  try {
    // Replace with your actual webhook secret
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret_here';
    
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(body, signature!, endpointSecret);
    } else {
      // For testing without webhook signature verification
      event = JSON.parse(body);
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.log(`⚠️  Webhook signature verification failed.`, errorMessage);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.trial_will_end':
      const trialEnding = event.data.object;
      console.log(`Subscription trial ending: ${trialEnding.id}`);
      // Handle trial ending
      break;
      
    case 'customer.subscription.deleted':
      const subscriptionDeleted = event.data.object;
      console.log(`Subscription deleted: ${subscriptionDeleted.id}`);
      // Handle subscription deletion
      break;
      
    case 'customer.subscription.created':
      const subscriptionCreated = event.data.object;
      console.log(`Subscription created: ${subscriptionCreated.id}`);
      // Handle subscription creation
      break;
      
    case 'customer.subscription.updated':
      const subscriptionUpdated = event.data.object;
      console.log(`Subscription updated: ${subscriptionUpdated.id}`);
      // Handle subscription updates
      break;
      
    case 'entitlements.active_entitlement_summary.updated':
      const entitlementUpdated = event.data.object;
      console.log(`Entitlement updated: ${entitlementUpdated.id}`);
      // Handle entitlement updates
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
} 