"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  MessageSquare,
  Star,
  Wallet,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Flag,
  PlusCircle,
} from "lucide-react";
import { useState } from "react";
import { Store } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const vendorNav: NavItem[] = [
  { label: "Overview", href: "/dashboard/vendor", icon: LayoutDashboard },
  { label: "Products", href: "/dashboard/vendor/products", icon: Package },
  { label: "New Product", href: "/dashboard/vendor/products/new", icon: PlusCircle },
  { label: "Analytics", href: "/dashboard/vendor/analytics", icon: BarChart3 },
  { label: "Balance", href: "/dashboard/vendor/balance", icon: Wallet },
  { label: "Messages", href: "/dashboard/vendor/messages", icon: MessageSquare },
  { label: "Settings", href: "/dashboard/vendor/settings", icon: Settings },
];

const buyerNav: NavItem[] = [
  { label: "Overview", href: "/dashboard/buyer", icon: LayoutDashboard },
  { label: "Orders", href: "/dashboard/buyer/orders", icon: ShoppingBag },
  { label: "Downloads", href: "/dashboard/buyer/downloads", icon: Package },
  { label: "Reviews", href: "/dashboard/buyer/reviews", icon: Star },
  { label: "Messages", href: "/dashboard/buyer/messages", icon: MessageSquare },
  { label: "Settings", href: "/dashboard/buyer/settings", icon: Settings },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
  { label: "Disputes", href: "/admin/disputes", icon: Flag },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function DashboardSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const role = session?.user?.role;
  const nav =
    role === "ADMIN" ? adminNav : role === "VENDOR" ? vendorNav : buyerNav;

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-[hsl(var(--card))] transition-[width] duration-300 ease-in-out h-screen sticky top-0 overflow-hidden",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand */}
      <div className={cn("flex h-16 items-center border-b border-border px-4", collapsed ? "justify-center" : "gap-3")}>
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-brand-500 shadow-brand">
          <Store className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-base font-bold truncate text-[hsl(var(--foreground))]">
            quwahmarket<span className="text-brand-500">-saas</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {nav.map((item) => {
          const isActive =
            item.href === "/dashboard/vendor" || item.href === "/dashboard/buyer" || item.href === "/admin"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-brand-500/10 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400 shadow-[inset_2px_0_0_0_hsl(var(--primary))]"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 flex-shrink-0 transition-colors",
                  isActive ? "text-brand-500 dark:text-brand-400" : ""
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      {!collapsed && session?.user && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 rounded-xl p-2 bg-[hsl(var(--muted))]">
            <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-brand-sm">
              {session.user.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate text-[hsl(var(--foreground))]">{session.user.name}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] capitalize">{session.user.role?.toLowerCase()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-[hsl(var(--card))] shadow-md hover:bg-[hsl(var(--muted))] transition-colors z-10"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
        )}
      </button>
    </aside>
  );
}

