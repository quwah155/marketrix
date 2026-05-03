import { requireAdmin } from "@/server/guards/auth.guard";
import { formatDate, formatPrice } from "@/lib/utils";
import { AdminProductActions } from "@/components/admin/product-actions";
import { Badge, Card } from "@/components/ui/card";
import { ProductStatus } from "@/types/db";
import { getAdminProductsData } from "@/services/admin-query.service";

export default async function AdminProductsPage() {
  await requireAdmin();

  const products = await getAdminProductsData();

  const statusVariant = (status: ProductStatus) =>
    status === ProductStatus.PUBLISHED
      ? "success"
      : status === ProductStatus.DRAFT
        ? "secondary"
        : "danger";

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
                {[
                  "Product",
                  "Vendor",
                  "Price",
                  "Status",
                  "Orders",
                  "Reviews",
                  "Created",
                  "Actions",
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
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="transition-colors hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    <p className="max-w-[200px] truncate text-sm font-medium">
                      {product.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.category}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {product.vendor?.user?.name ?? "Unknown vendor"}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(product.status)}>
                      {product.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">{product._count.orders}</td>
                  <td className="px-4 py-3 text-sm">{product._count.reviews}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(product.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <AdminProductActions
                      productId={product.id}
                      currentStatus={product.status}
                    />
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
