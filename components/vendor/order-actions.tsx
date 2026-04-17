"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatus } from "@/types/db";
import { syncVendorOrder } from "@/server/actions/vendor-order.actions";

export function VendorOrderActions({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (status !== OrderStatus.PENDING) return null;

  async function handleSync() {
    setLoading(true);
    try {
      const result = await syncVendorOrder(orderId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(result.message ?? "Order synced");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      isLoading={loading}
      leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
      onClick={handleSync}
    >
      Sync payment
    </Button>
  );
}
