import Link from "next/link";
import { XCircle, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Cancelled — quwahmarket-saas",
};

export default function CheckoutCancelPage() {
  return (
    <div className="w-full max-w-md mx-auto text-center animate-fade-in">
      {/* Icon */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100/10 border border-red-500/20 mb-6 mx-auto">
        <XCircle className="h-10 w-10 text-red-400" />
      </div>

      <h1 className="text-3xl font-bold text-white mb-3">
        Payment Cancelled
      </h1>
      <p className="text-brand-200 max-w-sm mx-auto mb-8 leading-relaxed">
        Your payment was cancelled and you have not been charged. Your cart
        items are still available whenever you&apos;re ready.
      </p>

      {/* FAQ cards */}
      <div className="grid grid-cols-1 gap-3 mb-8 text-left">
        {[
          {
            q: "Was I charged?",
            a: "No. No payment was processed and your card was not charged.",
          },
          {
            q: "Can I try again?",
            a: "Yes! Simply go back to the product page and click 'Buy Now' again.",
          },
          {
            q: "Need help?",
            a: "Message the vendor directly via the product page if you have questions.",
          },
        ].map(({ q, a }) => (
          <div
            key={q}
            className="rounded-2xl border border-brand-500/20 bg-brand-500/10 px-5 py-4"
          >
            <p className="text-sm font-semibold text-white mb-1">{q}</p>
            <p className="text-sm text-brand-200">{a}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/">
          <Button
            variant="secondary"
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border-brand-500/30 text-white"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
        </Link>
        <Link href="/dashboard/buyer/orders">
          <Button className="w-full sm:w-auto">
            <ShoppingBag className="h-4 w-4 mr-2" />
            View My Orders
          </Button>
        </Link>
      </div>

      <p className="mt-6 text-xs text-brand-400">
        Questions?{" "}
        <Link href="/dashboard/buyer/messages" className="underline hover:text-brand-200">
          Contact support via messages
        </Link>
      </p>
    </div>
  );
}

