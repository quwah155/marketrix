import Link from "next/link";
import { requireVendor } from "@/server/guards/auth.guard";
import { getVendorOrdersData } from "@/services/vendor-query.service";
import { formatDate, formatPrice } from "@/lib/utils";
import { OrderStatus } from "@/types/db";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, Clock3, CircleCheck, RotateCcw, AlertTriangle } from "lucide-react";
import { VendorOrderActions } from "@/components/vendor/order-actions";

const statusVariant = (status: OrderStatus) => {
  if (status === OrderStatus.COMPLETED) return "success";
  if (status === OrderStatus.PENDING) return "warning";
  if (status === OrderStatus.REFUNDED) return "secondary";
  return "danger";
};

export default async function VendorOrdersPage() {
  const user = await requireVendor();
  const data = await getVendorOrdersData(user.id);
  const orders = data?.orders ?? [];
  const stats = data?.stats ?? {
    total: 0,
    pending: 0,
    completed: 0,
    refunded: 0,
    failed: 0,
  };

  const statCards = [
    { label: "Total Orders", value: stats.total, icon: ShoppingBag, color: "text-brand-500", bg: "bg-brand-50 dark:bg-brand-950" },
    { label: "Pending", value: stats.pending, icon: Clock3, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950" },
    { label: "Completed", value: stats.completed, icon: CircleCheck, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950" },
    { label: "Refunded / Failed", value: stats.refunded + stats.failed, icon: RotateCcw, color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-900" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Track paid, pending, refunded, and failed purchases for your products.
          </p>
        </div>
        <Link href="/dashboard/vendor/products">
          <Button variant="secondary">View products</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <div className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px]">
            <thead>
              <tr className="border-b border-border">
                {["Product", "Buyer", "Amount", "Vendor Earning", "Status", "Purchased", "Actions"].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Package className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                    <p className="text-base font-semibold">No orders yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Orders for your published products will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-4 py-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{order.product.title}</p>
                        <Link
                          href={`/products/${order.product.slug}`}
                          className="text-xs text-brand-500 hover:underline"
                        >
                          View listing
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <p className="font-medium">{order.buyer.name ?? "Unknown buyer"}</p>
                      <p className="text-xs text-muted-foreground">{order.buyer.email}</p>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold">{formatPrice(order.amount)}</td>
                    <td className="px-4 py-4 text-sm">{formatPrice(order.vendorEarning)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                        {order.status === OrderStatus.PENDING && (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Awaiting confirmation
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <VendorOrderActions orderId={order.id} status={order.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
