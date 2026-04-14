"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { deleteProduct } from "@/server/actions/product.actions";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function DeleteProductButton({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    try {
      const result = await deleteProduct(productId);
      if (!result.success) { toast.error(result.error); return; }
      toast.success("Product deleted");
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="ghost" size="icon-sm" title="Delete" onClick={() => setOpen(true)}>
        <Trash2 className="h-3.5 w-3.5 text-red-500" />
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Delete Product" description="This action cannot be undone. The product and all its data will be permanently removed." size="sm">
        <div className="flex gap-3 justify-end mt-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="danger" isLoading={loading} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </>
  );
}
