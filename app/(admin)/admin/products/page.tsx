import { requireAdmin } from "@/server/guards/auth.guard";
import { formatPrice, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/card";
import { ProductStatus } from "@/types/db";
import { AdminProductActions } from "@/components/admin/product-actions";
import { getAdminProductsData } from "@/services/admin-query.service";

export default async function AdminProductsPage() {
  await requireAdmin();

  const products = await getAdminProductsData();

  const statusVariant = (s: ProductStatus) =>
    s === ProductStatus.PUBLISHED ? "success" : s === ProductStatus.DRAFT ? "secondary" : "danger";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Product Moderation</h1>
        <p className="text-muted-foreground">{products.length} total products</p>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Product", "Vendor", "Price", "Status", "Orders", "Reviews", "Created", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium max-w-[200px] truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.category}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">{p.vendor.user.name}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(p.status)}>{p.status}</Badge></td>
                  <td className="px-4 py-3 text-sm">{p._count.orders}</td>
                  <td className="px-4 py-3 text-sm">{p._count.reviews}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-3">
                    <AdminProductActions productId={p.id} currentStatus={p.status} />
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
