import { requireAdmin } from "@/server/guards/auth.guard";
import { formatDate, formatPrice } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { resolveDisputeAction } from "@/server/actions/admin.actions";
import { OrderStatus } from "@/types/db";
import { getAdminDisputesData } from "@/services/admin-query.service";

export default async function AdminDisputesPage() {
  await requireAdmin();

  const disputes = await getAdminDisputesData();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Dispute Resolution</h1>
        <p className="text-muted-foreground">
          Mock dispute queue based on failed/refunded orders
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Order", "Buyer", "Vendor", "Amount", "Status", "Updated", "Actions"].map((h) => (
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
              {disputes.map((order) => (
                <tr key={order.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{order.product.title}</p>
                    <p className="text-xs text-muted-foreground">{order.id}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {order.buyer.name ?? "Unknown"} ({order.buyer.email})
                  </td>
                  <td className="px-4 py-3 text-sm">{order.product.vendor.user.name ?? "Unknown"}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{formatPrice(order.amount)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={order.status === OrderStatus.REFUNDED ? "warning" : "danger"}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(order.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <form action={resolveDisputeAction.bind(null, order.id, "mark_completed")}>
                        <Button type="submit" size="sm" variant="success">
                          Mark Completed
                        </Button>
                      </form>
                      <form action={resolveDisputeAction.bind(null, order.id, "mark_refunded")}>
                        <Button type="submit" size="sm" variant="secondary">
                          Keep Refunded
                        </Button>
                      </form>
                    </div>
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
