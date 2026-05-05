"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/layout/brand-logo";
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
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const vendorNav: NavItem[] = [
  { label: "Overview", href: "/dashboard/vendor", icon: LayoutDashboard },
  { label: "Orders", href: "/dashboard/vendor/orders", icon: ShoppingBag },
  { label: "Products", href: "/dashboard/vendor/products", icon: Package },
  {
    label: "New Product",
    href: "/dashboard/vendor/products/new",
    icon: PlusCircle,
  },
  { label: "Analytics", href: "/dashboard/vendor/analytics", icon: BarChart3 },
  { label: "Balance", href: "/dashboard/vendor/balance", icon: Wallet },
  {
    label: "Messages",
    href: "/dashboard/vendor/messages",
    icon: MessageSquare,
  },
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

/* ─────────────────────────────────────────────
   Shared nav list used by both mobile & desktop
───────────────────────────────────────────── */
function SidebarNav({
  nav,
  pathname,
  collapsed,
  onNavigate,
}: {
  nav: NavItem[];
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
      {nav.map((item) => {
        const isActive =
          item.href === "/dashboard/vendor" ||
          item.href === "/dashboard/buyer" ||
          item.href === "/admin"
            ? pathname === item.href
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
              collapsed ? "justify-center" : "",
              isActive
                ? "bg-brand-500/15 text-brand-400 shadow-[inset_2px_0_0_0_hsl(var(--primary)),0_10px_24px_-18px_rgba(225,255,81,0.8)]"
                : "text-[hsl(var(--muted-foreground))] hover:bg-white/6 hover:text-[hsl(var(--foreground))]",
            )}
          >
            <item.icon
              className={cn(
                "h-4 w-4 flex-shrink-0 transition-colors",
                isActive ? "text-brand-400" : "",
              )}
            />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarUserInfo({ session }: { session: ReturnType<typeof useSession>["data"] }) {
  if (!session?.user) return null;
  return (
    <div className="p-4 border-t border-border">
      <div className="image-glass flex items-center gap-3 rounded-xl p-2">
        <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-brand-sm">
          {session.user.name?.[0]?.toUpperCase() ?? "U"}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate text-[hsl(var(--foreground))]">
            {session.user.name}
          </p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] capitalize">
            {session.user.role?.toLowerCase()}
          </p>
        </div>
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = session?.user?.role;
  const nav =
    role === "ADMIN" ? adminNav : role === "VENDOR" ? vendorNav : buyerNav;

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* ═══════ MOBILE TOP BAR ═══════ */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center gap-3 border-b border-white/10 bg-[hsl(var(--background))]/90 backdrop-blur-xl px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-white/6 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <BrandLogo href="/" compact />
        <div className="ml-auto flex items-center gap-2">
          {session?.user && (
            <div
              className="h-7 w-7 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold shadow-brand-sm"
              style={{ color: "#00272c" }}
            >
              {session.user.name?.[0]?.toUpperCase() ?? "U"}
            </div>
          )}
        </div>
      </div>

      {/* ═══════ MOBILE OVERLAY ═══════ */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ═══════ MOBILE SLIDE-IN SIDEBAR ═══════ */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col border-r border-white/12 bg-[hsl(var(--background))] transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Mobile sidebar header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <BrandLogo href="/" />
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-white/6 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <SidebarNav
          nav={nav}
          pathname={pathname}
          collapsed={false}
          onNavigate={() => setMobileOpen(false)}
        />
        <SidebarUserInfo session={session} />
      </aside>

      {/* ═══════ DESKTOP SIDEBAR ═══════ */}
      <aside
        className={cn(
          "hidden lg:flex glass-card sticky top-0 h-screen flex-col overflow-hidden border-r border-white/12 transition-[width] duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-border px-4",
            collapsed ? "justify-center" : "gap-3",
          )}
        >
          <BrandLogo href="/" showWordmark={!collapsed} compact={collapsed} />
        </div>

        <SidebarNav nav={nav} pathname={pathname} collapsed={collapsed} />

        {!collapsed && <SidebarUserInfo session={session} />}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="image-glass absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full shadow-md transition-colors hover:scale-105"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
          )}
        </button>
      </aside>
    </>
  );
}
