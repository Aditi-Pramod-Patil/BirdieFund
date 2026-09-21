import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// ---------------------------------------------------------------------------
// Environment Variable Guards
// ---------------------------------------------------------------------------
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const APP_URL = process.env.VITE_APP_URL || 'http://localhost:5173';

if (!STRIPE_SECRET_KEY) {
  console.error('[api/portal] STRIPE_SECRET_KEY is not set.');
}

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
// POST /api/portal — Create a Stripe Customer Portal Session
// Allows active subscribers to manage billing, update payment methods,
// or cancel their subscription through Stripe's hosted portal.
// ---------------------------------------------------------------------------
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const stripe = getStripe();
    const { stripeCustomerId } = req.body as {
      stripeCustomerId: string;
    };

    // Validate required field
    if (!stripeCustomerId) {
      return res.status(400).json({
        error: 'Missing required field: stripeCustomerId is required.',
      });
    }

    // Create Stripe Billing Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${APP_URL}/?portal=returned`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('[api/portal] Error creating portal session:', err.message);
    return res.status(500).json({
      error: err.message || 'Failed to create customer portal session.',
    });
  }
}
