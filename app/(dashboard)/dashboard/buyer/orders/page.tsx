import { requireAuth } from "@/server/guards/auth.guard";
import { formatPrice, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";
import { OrderStatus } from "@/types/db";
import Image from "next/image";
import Link from "next/link";
import { getBuyerOrdersData } from "@/services/buyer-query.service";

const statusVariant = (s: OrderStatus) => {
  if (s === OrderStatus.COMPLETED) return "success";
  if (s === OrderStatus.PENDING) return "warning";
  if (s === OrderStatus.REFUNDED) return "secondary";
  return "danger";
};

export default async function BuyerOrdersPage() {
  const user = await requireAuth();

  const orders = await getBuyerOrdersData(user.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground">{orders.length} total purchases</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-20 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">Browse the marketplace to find your first product</p>
            <Link href="/" className="text-brand-500 font-medium hover:underline">Browse Products →</Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="pt-5">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    {order.product.thumbnail ? (
                      <Image src={order.product.thumbnail} alt={order.product.title} fill className="object-cover" />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${order.product.slug}`} className="text-sm font-semibold hover:text-brand-500 transition-colors line-clamp-1">
                      {order.product.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      by {order.product.vendor.user.name} · {formatDate(order.createdAt)}
                    </p>
                    <Badge variant="default" className="mt-1 text-[10px]">{order.product.category}</Badge>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-bold">{formatPrice(order.amount)}</p>
                    <Badge variant={statusVariant(order.status)} className="mt-1">{order.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
