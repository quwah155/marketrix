import { requireVendor } from "@/server/guards/auth.guard";
import { formatPrice, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, Edit, Eye } from "lucide-react";
import Link from "next/link";
import { ProductStatus } from "@/types/db";
import { DeleteProductButton } from "@/components/vendor/delete-product-button";
import { getVendorProductsData } from "@/services/vendor-query.service";

export default async function VendorProductsPage() {
  const user = await requireVendor();
  const data = await getVendorProductsData(user.id);
  if (!data) return null;
  const { products } = data;

  const statusVariant = (status: ProductStatus) => {
    if (status === ProductStatus.PUBLISHED) return "success";
    if (status === ProductStatus.DRAFT) return "secondary";
    return "danger";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">{products.length} total products</p>
        </div>
        <Link href="/dashboard/vendor/products/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>New Product</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products yet</h3>
            <p className="text-muted-foreground mb-6">Start selling by creating your first product</p>
            <Link href="/dashboard/vendor/products/new">
              <Button leftIcon={<Plus className="h-4 w-4" />}>Create Product</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Views</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-sm">{product.title}</div>
                      <div className="text-xs text-muted-foreground">{product.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant(product.status)}>{product.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4 text-sm">{product._count.orders}</td>
                    <td className="px-6 py-4 text-sm">{product.views.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(product.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/products/${product.slug}`} target="_blank">
                          <Button variant="ghost" size="icon-sm" title="Preview">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/vendor/products/${product.id}/edit`}>
                          <Button variant="ghost" size="icon-sm" title="Edit">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <DeleteProductButton productId={product.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
