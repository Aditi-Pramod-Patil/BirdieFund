import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Environment Variable Guards
// ---------------------------------------------------------------------------
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!STRIPE_SECRET_KEY) console.error('[webhook] STRIPE_SECRET_KEY is not set.');
if (!STRIPE_WEBHOOK_SECRET) console.error('[webhook] STRIPE_WEBHOOK_SECRET is not set.');
if (!SUPABASE_URL) console.error('[webhook] SUPABASE_URL is not set.');
if (!SUPABASE_SERVICE_ROLE_KEY) console.error('[webhook] SUPABASE_SERVICE_ROLE_KEY is not set.');

// ---------------------------------------------------------------------------
// Stripe Client
// ---------------------------------------------------------------------------
function getStripe(): Stripe {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not configured.');
  }
  return new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-05-28.basil' });
}

// ---------------------------------------------------------------------------
// Supabase Admin Client (service role key bypasses RLS)
// ---------------------------------------------------------------------------
function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured.');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// Helper: Map Stripe subscription status to our subscription_status enum
// ---------------------------------------------------------------------------
function mapStripeStatus(
  stripeStatus: string
): 'active' | 'inactive' | 'canceled' | 'lapsed' {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'canceled':
      return 'canceled';
    case 'past_due':
    case 'unpaid':
      return 'lapsed';
    case 'incomplete':
    case 'incomplete_expired':
    case 'paused':
    default:
      return 'inactive';
  }
}

// ---------------------------------------------------------------------------
// Helper: Determine subscription tier from Stripe price metadata
// ---------------------------------------------------------------------------
function resolveTier(planType?: string): 'monthly' | 'yearly' {
  if (planType === 'yearly' || planType === 'annual') return 'yearly';
  return 'monthly';
}

// ---------------------------------------------------------------------------
// IMPORTANT: Disable Vercel's default body parsing so we can access the raw
// body for Stripe webhook signature verification.
// ---------------------------------------------------------------------------
export const config = {
  api: {
    bodyParser: false,
  },
};

// ---------------------------------------------------------------------------
// Helper: Read raw request body as a Buffer
// ---------------------------------------------------------------------------
async function readRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// ---------------------------------------------------------------------------
// POST /api/webhooks/stripe — Stripe Webhook Handler
// ---------------------------------------------------------------------------
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const stripe = getStripe();
  const supabaseAdmin = getSupabaseAdmin();

  // -----------------------------------------------------------------------
  // 1. Verify Stripe webhook signature
  // -----------------------------------------------------------------------
  const sig = req.headers['stripe-signature'] as string;
  if (!sig || !STRIPE_WEBHOOK_SECRET) {
    console.error('[webhook] Missing stripe-signature header or STRIPE_WEBHOOK_SECRET.');
    return res.status(400).json({ error: 'Missing Stripe signature or webhook secret.' });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('[webhook] Signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  // -----------------------------------------------------------------------
  // 2. Handle specific event types
  // -----------------------------------------------------------------------
  try {
    switch (event.type) {
      // -------------------------------------------------------------------
      // checkout.session.completed
      // Fired when a user successfully completes a Stripe Checkout session.
      // Extract user_id from metadata and activate the subscription.
      // -------------------------------------------------------------------
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const planType = session.metadata?.plan_type;
        const customerId =
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id;

        if (!userId) {
          console.error('[webhook] checkout.session.completed: Missing user_id in metadata.');
          return res.status(400).json({ error: 'Missing user_id in session metadata.' });
        }

        console.log(
          `[webhook] checkout.session.completed — userId=${userId}, customerId=${customerId}, plan=${planType}`
        );

        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'active',
            subscription_tier: resolveTier(planType),
            stripe_customer_id: customerId || null,
          })
          .eq('id', userId);

        if (updateError) {
          console.error('[webhook] Failed to update profile:', updateError.message);
          return res.status(500).json({ error: 'Failed to update user profile.' });
        }

        console.log(`[webhook] Profile updated successfully for userId=${userId}.`);
        break;
      }

      // -------------------------------------------------------------------
      // customer.subscription.updated
      // Fired when a subscription is renewed, canceled, or payment lapses.
      // Synchronize the status in real time.
      // -------------------------------------------------------------------
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer?.id;
        const subUserId = subscription.metadata?.user_id;
        const subPlanType = subscription.metadata?.plan_type;

        const newStatus = mapStripeStatus(subscription.status);
        console.log(
          `[webhook] customer.subscription.updated — customerId=${customerId}, stripeStatus=${subscription.status}, mappedStatus=${newStatus}`
        );

        // Find user by stripe_customer_id or metadata user_id
        const updateFilter = subUserId
          ? { column: 'id', value: subUserId }
          : { column: 'stripe_customer_id', value: customerId };

        const { error: subUpdateError } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: newStatus,
            ...(subPlanType ? { subscription_tier: resolveTier(subPlanType) } : {}),
          })
          .eq(updateFilter.column, updateFilter.value);

        if (subUpdateError) {
          console.error('[webhook] Failed to update subscription status:', subUpdateError.message);
          return res.status(500).json({ error: 'Failed to sync subscription status.' });
        }

        break;
      }

      // -------------------------------------------------------------------
      // customer.subscription.deleted
      // Fired when a subscription is fully terminated / ended.
      // Mark the user's subscription as inactive.
      // -------------------------------------------------------------------
      case 'customer.subscription.deleted': {
        const deletedSub = event.data.object as Stripe.Subscription;
        const delCustomerId =
          typeof deletedSub.customer === 'string'
            ? deletedSub.customer
            : deletedSub.customer?.id;
        const delUserId = deletedSub.metadata?.user_id;

        console.log(
          `[webhook] customer.subscription.deleted — customerId=${delCustomerId}`
        );

        const delFilter = delUserId
          ? { column: 'id', value: delUserId }
          : { column: 'stripe_customer_id', value: delCustomerId };

        const { error: delError } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'inactive',
          })
          .eq(delFilter.column, delFilter.value);

        if (delError) {
          console.error('[webhook] Failed to mark subscription as inactive:', delError.message);
          return res.status(500).json({ error: 'Failed to deactivate subscription.' });
        }

        break;
      }

      // -------------------------------------------------------------------
      // Unhandled event types — acknowledge receipt
      // -------------------------------------------------------------------
      default:
        console.log(`[webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err: any) {
    console.error('[webhook] Error processing event:', err.message);
    return res.status(500).json({ error: 'Internal error processing webhook event.' });
  }

  // Acknowledge receipt to Stripe
  return res.status(200).json({ received: true });
}
