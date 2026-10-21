import { loadStripe, type Stripe } from '@stripe/stripe-js';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

/** loadStripe injects a <script> tag, so the promise is memoised across renders. */
let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Resolves with the Stripe.js instance. Resolves with `null` when no publishable key is set,
 * which disables card payments. Rejects if the Stripe.js script cannot be loaded.
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!publishableKey) return Promise.resolve(null);
  if (!stripePromise) stripePromise = loadStripe(publishableKey);
  return stripePromise;
};

/**
 * True when `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is non-empty. Next.js inlines `NEXT_PUBLIC_`
 * values at build time, so changing the key needs a new build.
 */
export const isStripeConfigured = (): boolean => Boolean(publishableKey);
