import { requireAdmin } from "@/server/guards/auth.guard";
import { formatPrice, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/card";
import { DollarSign, Users, Package, ShoppingBag, TrendingUp, ArrowUpRight } from "lucide-react";
import { AdminRevenueChart } from "@/components/admin/admin-revenue-chart";
import Link from "next/link";
import { getAdminDashboardData } from "@/services/admin.service";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const {
    totalRevenue,
    totalFees,
    vendorCount,
    buyerCount,
    activeProducts,
    ordersThisMonth,
    recentOrders,
    recentUsers,
    chartData,
  } = await getAdminDashboardData();

  const stats = [
    { label: "Total Revenue", value: formatPrice(totalRevenue._sum.amount ?? 0), icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950", href: "/admin/orders" },
    { label: "Platform Fees", value: formatPrice(totalFees._sum.platformFee ?? 0), icon: TrendingUp, color: "text-brand-500", bg: "bg-brand-50 dark:bg-brand-950", href: "/admin/analytics" },
    { label: "Active Products", value: activeProducts.toString(), icon: Package, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950", href: "/admin/products" },
    { label: "Orders This Month", value: ordersThisMonth.toString(), icon: ShoppingBag, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950", href: "/admin/orders" },
    { label: "Total Vendors", value: vendorCount.toString(), icon: Users, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950", href: "/admin/users" },
    { label: "Total Buyers", value: buyerCount.toString(), icon: Users, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950", href: "/admin/users" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and metrics</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card hover>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <div className="flex items-center gap-1">
                    <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <Card>
        <CardHeader><CardTitle>Revenue & Platform Fees (6 months)</CardTitle></CardHeader>
        <CardContent><AdminRevenueChart data={chartData} /></CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <Link href="/admin/orders" className="text-xs text-brand-500 hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{o.product.title}</p>
                  <p className="text-xs text-muted-foreground">{o.buyer.name} · {formatDate(o.createdAt)}</p>
                </div>
                <span className="text-xs font-semibold text-emerald-600">{formatPrice(o.amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base">Recent Users</CardTitle>
            <Link href="/admin/users" className="text-xs text-brand-500 hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted transition-colors">
                <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {u.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <Badge variant={u.role === "ADMIN" ? "danger" : u.role === "VENDOR" ? "default" : "secondary"}>
                  {u.role}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
