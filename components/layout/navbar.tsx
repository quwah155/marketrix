"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  Store,
  Sun,
  Moon,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const { setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const user = session?.user;

  const dashboardHref =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "VENDOR"
      ? "/dashboard/vendor"
      : "/dashboard/buyer";

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-[hsl(var(--background))]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500 shadow-brand">
              <Store className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">
              quwahmarket<span className="text-brand-500">-saas</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/products"
              className="relative px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors group"
            >
              Marketplace
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 bg-brand-500 rounded-full transition-all duration-200 group-hover:w-4/5" />
            </Link>
            <Link
              href="/products?category=COURSES"
              className="relative px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors group"
            >
              Courses
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 bg-brand-500 rounded-full transition-all duration-200 group-hover:w-4/5" />
            </Link>
            <Link
              href="/products?category=TEMPLATES"
              className="relative px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors group"
            >
              Templates
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 bg-brand-500 rounded-full transition-all duration-200 group-hover:w-4/5" />
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle — reads actual DOM class so it's always correct */}
            <button
              onClick={() => {
                const isDark = document.documentElement.classList.contains("dark");
                setTheme(isDark ? "light" : "dark");
              }}
              className="h-9 w-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {/* Show moon in light, sun in dark */}
              <Sun className="h-4 w-4 hidden dark:block" />
              <Moon className="h-4 w-4 block dark:hidden" />
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-xl border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
                >
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
                      {user.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  )}
                  <span className="hidden sm:inline">{user.name?.split(" ")[0]}</span>
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 z-20 w-52 rounded-2xl border border-border bg-card shadow-glass overflow-hidden animate-slide-down">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <div className="p-1.5">
                        <Link
                          href={dashboardHref}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-muted transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                          Dashboard
                        </Link>
                        {user.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-muted transition-colors"
                          >
                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                            Admin Panel
                          </Link>
                        )}
                        <Link
                          href="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-muted transition-colors"
                        >
                          <User className="h-4 w-4 text-muted-foreground" />
                          Settings
                        </Link>
                        <hr className="my-1 border-border" />
                        <button
                          onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Get started</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-border space-y-1 animate-slide-down">
            <Link href="/products" className="block px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-muted transition-colors" onClick={() => setMenuOpen(false)}>Marketplace</Link>
            <Link href="/products?category=COURSES" className="block px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-muted transition-colors" onClick={() => setMenuOpen(false)}>Courses</Link>
            <Link href="/products?category=TEMPLATES" className="block px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-muted transition-colors" onClick={() => setMenuOpen(false)}>Templates</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

