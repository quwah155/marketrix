import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle, Download, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { getCheckoutOrderDetails } from "@/services/checkout-query.service";

interface Props { searchParams: { session_id?: string } }

async function OrderDetails({ sessionId }: { sessionId: string }) {
  const order = await getCheckoutOrderDetails(sessionId);
  if (!order) return null;

  return (
    <div className="mt-8 p-5 rounded-2xl border border-border bg-card text-left max-w-sm mx-auto">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Order Summary</p>
      <p className="font-semibold text-sm mb-1">{order.product.title}</p>
      <p className="text-2xl font-bold text-emerald-600">{formatPrice(order.amount)}</p>
      <div className="mt-4 flex gap-2">
        {order.product.fileUrl && (
          <a href={order.product.fileUrl} download target="_blank" rel="noreferrer">
            <Button size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>Download</Button>
          </a>
        )}
        <Link href="/dashboard/buyer/orders">
          <Button variant="secondary" size="sm" leftIcon={<ShoppingBag className="h-3.5 w-3.5" />}>Orders</Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage({ searchParams }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 mb-6 animate-fade-in">
        <CheckCircle className="h-10 w-10 text-emerald-500" />
      </div>
      <h1 className="text-3xl font-bold mb-3">Payment Successful! 🎉</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        Thank you for your purchase. Your order has been confirmed and your digital product is ready.
      </p>

      {searchParams.session_id && (
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading order details...</p>}>
          <OrderDetails sessionId={searchParams.session_id} />
        </Suspense>
      )}

      <div className="flex gap-3 mt-8">
        <Link href="/"><Button variant="secondary" leftIcon={<Home className="h-4 w-4" />}>Back to Marketplace</Button></Link>
        <Link href="/dashboard/buyer/downloads"><Button leftIcon={<Download className="h-4 w-4" />}>My Downloads</Button></Link>
      </div>
    </div>
  );
}
