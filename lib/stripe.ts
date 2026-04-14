import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export const PLATFORM_FEE_PERCENT = 0.15; // 15%

export function calculateFees(amount: number): {
  platformFee: number;
  vendorEarning: number;
} {
  const platformFee = parseFloat((amount * PLATFORM_FEE_PERCENT).toFixed(2));
  const vendorEarning = parseFloat((amount - platformFee).toFixed(2));
  return { platformFee, vendorEarning };
}
