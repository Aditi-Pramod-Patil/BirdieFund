import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// ---------------------------------------------------------------------------
// Environment Variable Guards
// ---------------------------------------------------------------------------
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PRICE_MONTHLY = process.env.STRIPE_PRICE_MONTHLY;
const STRIPE_PRICE_YEARLY = process.env.STRIPE_PRICE_YEARLY;
const APP_URL = process.env.VITE_APP_URL || 'http://localhost:5173';

if (!STRIPE_SECRET_KEY) {
  console.error('[api/checkout] STRIPE_SECRET_KEY is not set.');
}

// ---------------------------------------------------------------------------
// Stripe Client (initialized lazily with env check)
// ---------------------------------------------------------------------------
function getStripe(): Stripe {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not configured.');
  }
  return new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-05-28.basil' });
}

// ---------------------------------------------------------------------------
// POST /api/checkout — Create a Stripe Checkout Session
// ---------------------------------------------------------------------------
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const stripe = getStripe();
    const { planType, userId, userEmail } = req.body as {
      planType: 'monthly' | 'yearly';
      userId: string;
      userEmail?: string;
    };

    // Validate required fields
    if (!planType || !userId) {
      return res.status(400).json({
        error: 'Missing required fields: planType and userId are required.',
      });
    }

    // Resolve Price ID from plan type
    const priceId = planType === 'yearly' ? STRIPE_PRICE_YEARLY : STRIPE_PRICE_MONTHLY;
    if (!priceId || priceId.includes('placeholder')) {
      return res.status(500).json({
        error: `Stripe Price ID for "${planType}" plan is not configured. Set STRIPE_PRICE_${planType.toUpperCase()} in your environment variables.`,
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        platform: 'BirdieFund',
        user_id: userId,
        plan_type: planType,
      },
      subscription_data: {
        description: 'BirdieFund Pro Golf Membership',
        metadata: {
          platform: 'BirdieFund',
          user_id: userId,
          plan_type: planType,
        },
      },
      ...(userEmail ? { customer_email: userEmail } : {}),
      success_url: `${APP_URL}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/?checkout=canceled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('[api/checkout] Error creating checkout session:', err.message);
    return res.status(500).json({
      error: err.message || 'Failed to create checkout session.',
    });
  }
}
