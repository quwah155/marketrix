import { requireAuth } from "@/server/guards/auth.guard";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Download, MessageSquare, Star, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { getBuyerDashboardData } from "@/services/buyer-query.service";

export default async function BuyerDashboardPage() {
  const user = await requireAuth();

  const { totalOrders, pendingOrders, totalSpent, unreadMessages, recentOrders } =
    await getBuyerDashboardData(user.id);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user.name?.split(" ")[0]} 👋</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your account</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Purchases", value: totalOrders, icon: ShoppingBag, href: "/dashboard/buyer/orders", color: "text-brand-500", bg: "bg-brand-50 dark:bg-brand-950" },
          { label: "Total Spent", value: formatPrice(totalSpent._sum.amount ?? 0), icon: LayoutDashboard, href: "/dashboard/buyer/orders", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950" },
          { label: "Pending Orders", value: pendingOrders, icon: Download, href: "/dashboard/buyer/orders", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950" },
          { label: "Unread Messages", value: unreadMessages, icon: MessageSquare, href: "/dashboard/buyer/messages", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950" },
        ].map((s) => (
          <Link key={s.label} href={s.href}>
            <Card hover>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                  <div className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/buyer/downloads">
          <Card hover className="text-center p-6 cursor-pointer">
            <Download className="h-8 w-8 text-brand-500 mx-auto mb-3" />
            <p className="font-semibold">My Downloads</p>
            <p className="text-sm text-muted-foreground">Access purchased files</p>
          </Card>
        </Link>
        <Link href="/dashboard/buyer/messages">
          <Card hover className="text-center p-6 cursor-pointer">
            <MessageSquare className="h-8 w-8 text-purple-500 mx-auto mb-3" />
            <p className="font-semibold">Messages</p>
            <p className="text-sm text-muted-foreground">Chat with vendors</p>
          </Card>
        </Link>
        <Link href="/">
          <Card hover className="text-center p-6 cursor-pointer">
            <Star className="h-8 w-8 text-amber-500 mx-auto mb-3" />
            <p className="font-semibold">Browse More</p>
            <p className="text-sm text-muted-foreground">Discover new products</p>
          </Card>
        </Link>
      </div>

      {/* Recent orders */}
      {recentOrders.length > 0 && (
        <Card>
          <div className="p-6 flex items-center justify-between border-b border-border">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link href="/dashboard/buyer/orders"><Button variant="ghost" size="sm">View all</Button></Link>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${o.product.slug}`} className="text-sm font-medium hover:text-brand-500 transition-colors">{o.product.title}</Link>
                </div>
                <span className="text-sm font-semibold text-brand-600">{formatPrice(o.amount)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
