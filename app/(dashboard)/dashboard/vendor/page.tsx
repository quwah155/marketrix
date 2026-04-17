import { requireVendor } from "@/server/guards/auth.guard";
import { formatPrice, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  DollarSign,
  Package,
  ShoppingBag,
  Plus,
  TrendingUp,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { ProductStatus } from "@/types/db";
import { getVendorDashboardData } from "@/services/vendor-query.service";
import type { OrderWithDetails, ProductWithVendor } from "@/types";

export default async function VendorDashboardPage() {
  const user = await requireVendor();
  const data = await getVendorDashboardData(user.id);
  const vendorProfile = data?.vendorProfile;

  if (!vendorProfile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h2 className="mb-2 text-2xl font-bold">Set up your vendor profile</h2>
        <p className="mb-6 text-muted-foreground">Complete your profile to start selling</p>
        <Link href="/dashboard/vendor/settings">
          <Button>Complete Profile</Button>
        </Link>
      </div>
    );
  }

  const { totalRevenue, totalOrders, totalViews, recentOrders } = data;
  const vendorProducts = vendorProfile.products as ProductWithVendor[];
  const vendorRecentOrders = recentOrders as OrderWithDetails[];

  const stats = [
    {
      label: "Total Revenue",
      value: formatPrice(totalRevenue._sum.vendorEarning ?? 0),
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      label: "Total Orders",
      value: totalOrders.toString(),
      icon: ShoppingBag,
      color: "text-brand-500",
      bg: "bg-brand-50 dark:bg-brand-950",
    },
    {
      label: "Product Views",
      value: (totalViews._sum.views ?? 0).toLocaleString(),
      icon: Eye,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950",
    },
    {
      label: "Balance",
      value: formatPrice(vendorProfile.balance),
      icon: TrendingUp,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.name?.split(" ")[0]}</p>
        </div>
        <Link href="/dashboard/vendor/products/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>New Product</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base">Your Products</CardTitle>
            <Link href="/dashboard/vendor/products">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {vendorProducts.length === 0 ? (
              <div className="py-8 text-center">
                <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No products yet</p>
                <Link href="/dashboard/vendor/products/new" className="mt-3 inline-block">
                  <Button size="sm">Create your first</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {vendorProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {product._count?.orders ?? 0} orders | {product.views} views
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          product.status === ProductStatus.PUBLISHED
                            ? "success"
                            : product.status === ProductStatus.DRAFT
                              ? "secondary"
                              : "danger"
                        }
                      >
                        {product.status}
                      </Badge>
                      <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base">Recent Sales</CardTitle>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/vendor/orders">
                <Button variant="ghost" size="sm">
                  View all
                </Button>
              </Link>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {vendorRecentOrders.length === 0 ? (
              <div className="py-8 text-center">
                <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vendorRecentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{order.product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.buyer.name} | {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">
                      +{formatPrice(order.vendorEarning)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
