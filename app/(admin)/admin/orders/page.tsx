import { requireAdmin } from "@/server/guards/auth.guard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/card";
import { formatDate, formatPrice } from "@/lib/utils";
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
                {["Product", "Buyer", "Vendor", "Amount", "Platform Fee", "Vendor Earning", "Status", "Date"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{order.product.title}</td>
                  <td className="px-4 py-3 text-sm">
                    {order.buyer.name ?? "Unknown"} ({order.buyer.email})
                  </td>
                  <td className="px-4 py-3 text-sm">{order.product.vendor.user.name ?? "Unknown"}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{formatPrice(order.amount)}</td>
                  <td className="px-4 py-3 text-sm">{formatPrice(order.platformFee)}</td>
                  <td className="px-4 py-3 text-sm">{formatPrice(order.vendorEarning)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
