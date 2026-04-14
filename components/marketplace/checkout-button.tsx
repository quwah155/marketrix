"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface CheckoutButtonProps {
  productId: string;
  isLoggedIn: boolean;
}

export function CheckoutButton({ productId, isLoggedIn }: CheckoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (!isLoggedIn) {
      router.push("/auth/login?callbackUrl=" + encodeURIComponent(window.location.href));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Checkout failed");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      className="w-full"
      size="lg"
      isLoading={loading}
      onClick={handleCheckout}
      leftIcon={<ShoppingCart className="h-4 w-4" />}
    >
      {isLoggedIn ? "Purchase Now" : "Sign in to Purchase"}
    </Button>
  );
}
