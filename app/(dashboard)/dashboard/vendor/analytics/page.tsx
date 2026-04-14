import { requireVendor } from "@/server/guards/auth.guard";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Eye, ShoppingBag, DollarSign } from "lucide-react";
import { VendorRevenueChart } from "@/components/vendor/revenue-chart";
import { getVendorAnalyticsData } from "@/services/vendor-query.service";

export default async function VendorAnalyticsPage() {
  const user = await requireVendor();
  const data = await getVendorAnalyticsData(user.id);
  if (!data) return null;
  const { vendorProfile, orders, topProducts, totalViews } = data;

  const now = new Date();

  // Aggregate by month
  const monthMap = new Map<string, { revenue: number; orders: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    monthMap.set(key, { revenue: 0, orders: 0 });
  }
  orders.forEach((o) => {
    const key = new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const existing = monthMap.get(key);
    if (existing) { existing.revenue += o.vendorEarning; existing.orders += 1; }
  });
  const chartData = Array.from(monthMap.entries()).map(([month, data]) => ({ month, ...data }));

  const totalRevenue = orders.reduce((sum, o) => sum + o.vendorEarning, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Last 6 months performance overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Revenue (6mo)", value: formatPrice(totalRevenue), icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950" },
          { label: "Orders (6mo)", value: orders.length.toString(), icon: ShoppingBag, color: "text-brand-500", bg: "bg-brand-50 dark:bg-brand-950" },
          { label: "Total Views", value: (totalViews._sum.views ?? 0).toLocaleString(), icon: Eye, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950" },
          { label: "Balance", value: formatPrice(vendorProfile.balance), icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                <div className={`h-8 w-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
              </div>
              <p className="text-xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader><CardTitle>Revenue Over Time</CardTitle></CardHeader>
        <CardContent>
          <VendorRevenueChart data={chartData} />
        </CardContent>
      </Card>

      {/* Top products */}
      <Card>
        <CardHeader><CardTitle>Top Products by Views</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4">
                <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.title}</p>
                  <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full"
                      style={{ width: `${Math.min(100, (p.views / (topProducts[0]?.views || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{p.views.toLocaleString()} views</p>
                  <p className="text-xs text-muted-foreground">{p._count.orders} orders</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
