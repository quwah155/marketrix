import Stripe from "stripe";

export const PLATFORM_FEE_PERCENT = 0.15; // 15%

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  _stripe = new Stripe(key, {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
  });
  return _stripe;
}

/** Convenience export — only call this from API routes / server actions, never at module init */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const s = getStripe();
    const value = (s as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(s);
    }
    return value;
  },
});

export function calculateFees(amount: number): {
  platformFee: number;
  vendorEarning: number;
} {
  const platformFee = parseFloat((amount * PLATFORM_FEE_PERCENT).toFixed(2));
  const vendorEarning = parseFloat((amount - platformFee).toFixed(2));
  return { platformFee, vendorEarning };
}
