"use client";

import { Button } from "@/components/ui/button";
import { ProductStatus } from "@/types/db";
import { suspendProduct, restoreProduct } from "@/server/actions/product.actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldOff, ShieldCheck } from "lucide-react";

export function AdminProductActions({ productId, currentStatus }: { productId: string; currentStatus: ProductStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const result = currentStatus === ProductStatus.SUSPENDED
        ? await restoreProduct(productId)
        : await suspendProduct(productId);
      if (!result.success) { toast.error(result.error); return; }
      toast.success(currentStatus === ProductStatus.SUSPENDED ? "Product restored" : "Product suspended");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={currentStatus === ProductStatus.SUSPENDED ? "success" : "danger"}
      size="sm"
      isLoading={loading}
      onClick={toggle}
      leftIcon={currentStatus === ProductStatus.SUSPENDED ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}
    >
      {currentStatus === ProductStatus.SUSPENDED ? "Restore" : "Suspend"}
    </Button>
  );
}
