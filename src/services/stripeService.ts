/**
 * Client-side Stripe Service
 *
 * Provides functions to initiate Stripe Checkout and Customer Portal sessions
 * by calling the Vercel serverless API endpoints. Falls back gracefully when
 * Stripe environment variables are not configured (demo/simulation mode).
 */

// ---------------------------------------------------------------------------
// Configuration Helpers
// ---------------------------------------------------------------------------

const PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

/**
 * Returns true if real Stripe credentials have been configured.
 * When false, the app should fall back to the local simulation flow.
 */
export function isStripeConfigured(): boolean {
  return (
    Boolean(PUBLISHABLE_KEY) &&
    PUBLISHABLE_KEY.startsWith('pk_') &&
    !PUBLISHABLE_KEY.includes('...')
  );
}

// ---------------------------------------------------------------------------
// Checkout Session
// ---------------------------------------------------------------------------

export interface CheckoutParams {
  planType: 'monthly' | 'yearly';
  userId: string;
  userEmail?: string;
}

/**
 * Calls the `/api/checkout` serverless function to create a Stripe Checkout
 * Session and redirects the user to the Stripe-hosted payment page.
 *
 * @throws Error if the API call fails or Stripe is not configured.
 */
export async function createCheckoutSession(params: CheckoutParams): Promise<void> {
  if (!isStripeConfigured()) {
    throw new Error(
      'Stripe is not configured. Set VITE_STRIPE_PUBLISHABLE_KEY with a valid key.'
    );
  }

  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Checkout session creation failed (HTTP ${response.status}).`);
  }

  const { url } = await response.json();
  if (!url) {
    throw new Error('No checkout URL returned from server.');
  }

  // Redirect to Stripe Hosted Checkout
  window.location.href = url;
}

// ---------------------------------------------------------------------------
// Customer Portal Session
// ---------------------------------------------------------------------------

export interface PortalParams {
  stripeCustomerId: string;
}

/**
 * Calls the `/api/portal` serverless function to create a Stripe Customer
 * Portal session and redirects the user to manage their subscription.
 *
 * @throws Error if the API call fails or stripeCustomerId is missing.
 */
export async function createCustomerPortalSession(params: PortalParams): Promise<void> {
  if (!params.stripeCustomerId) {
    throw new Error(
      'Cannot open customer portal: no Stripe Customer ID found on this account.'
    );
  }

  const response = await fetch('/api/portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Portal session creation failed (HTTP ${response.status}).`);
  }

  const { url } = await response.json();
  if (!url) {
    throw new Error('No portal URL returned from server.');
  }

  // Redirect to Stripe Customer Portal
  window.location.href = url;
}

// ---------------------------------------------------------------------------
// Price Helpers
// ---------------------------------------------------------------------------

/** Human-readable price labels for the two subscription tiers. */
export const PLAN_PRICES = {
  monthly: { amount: 24, label: '$24/mo', interval: 'month' },
  yearly: { amount: 220, label: '$220/yr', interval: 'year', savings: '24%' },
} as const;
