import { requireAdmin } from "@/server/guards/auth.guard";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge, Card } from "@/components/ui/card";
import { OrderStatus } from "@/types/db";
import { getAdminOrdersData } from "@/services/admin-query.service";

const statusVariant = (status: OrderStatus) => {
  if (status === OrderStatus.COMPLETED) return "success";
  if (status === OrderStatus.PENDING) return "warning";
  if (status === OrderStatus.REFUNDED) return "secondary";
  return "danger";
};

export default async function AdminOrdersPage() {
  await requireAdmin();

  const orders = await getAdminOrdersData();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground">{orders.length} recent transactions</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {[
                  "Product",
                  "Buyer",
                  "Vendor",
                  "Amount",
                  "Platform Fee",
                  "Vendor Earning",
                  "Status",
                  "Date",
                ].map((heading) => (
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
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-muted/40"
                >
                  <td className="px-4 py-3 text-sm font-medium">
                    {order.product?.title ?? "Unknown product"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {order.buyer?.name ?? "Unknown"} (
                    {order.buyer?.email ?? "unknown@example.com"})
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {order.product?.vendor?.user?.name ?? "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    {formatPrice(order.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatPrice(order.platformFee)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatPrice(order.vendorEarning)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
