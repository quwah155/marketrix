"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/layout/brand-logo";
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const user = session?.user;

  const dashboardHref =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "VENDOR"
      ? "/dashboard/vendor"
      : "/dashboard/buyer";
  const settingsHref =
    user?.role === "ADMIN"
      ? "/admin/settings"
      : user?.role === "VENDOR"
        ? "/dashboard/vendor/settings"
        : "/dashboard/buyer/settings";

  const navLinks = [
    { label: "Marketplace", href: "/products" },
    { label: "Courses", href: "/products?category=COURSES" },
    { label: "Templates", href: "/products?category=TEMPLATES" },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/20 bg-[hsl(var(--background))]/72 backdrop-blur-2xl supports-[backdrop-filter]:bg-[hsl(var(--background))]/62">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <BrandLogo />

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="group relative rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/40 hover:text-foreground dark:hover:bg-white/5"
              >
                {label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 rounded-full transition-all duration-200 group-hover:w-4/5" style={{ background: "#e1ff51" }} />
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Desktop auth actions — hidden on mobile */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="image-glass flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors hover:border-white/60 dark:hover:border-chartreuse/20"
                >
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={user.name ?? ""}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: "#e1ff51", color: "#00272c" }}
                    >
                      {user.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  )}
                  <span className="hidden sm:inline">{user.name?.split(" ")[0]}</span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="glass-card absolute right-0 top-full mt-2 z-20 w-56 overflow-hidden rounded-2xl shadow-glass animate-slide-down">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <div className="p-1.5">
                        <Link
                          href={dashboardHref}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-white/50 dark:hover:bg-white/5"
                        >
                          <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                          Dashboard
                        </Link>
                        <Link
                          href={settingsHref}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-white/50 dark:hover:bg-white/5"
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
              /* Desktop-only auth buttons */
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/auth/register">
                  <button className="cta-btn-primary px-4 py-2 text-sm font-semibold rounded-xl">
                    Get started
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile hamburger button */}
            <button
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ═══════ MOBILE MENU ═══════ */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 py-4 animate-slide-down">
            {/* Nav links */}
            <div className="space-y-1 mb-4">
              {navLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/50 dark:hover:bg-white/5"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </div>

            <hr className="border-white/10 mx-4 my-3" />

            {/* Auth section inside mobile menu */}
            {user ? (
              <div className="space-y-1">
                {/* User info */}
                <div className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.image}
                        alt={user.name ?? ""}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ background: "#e1ff51", color: "#00272c" }}
                      >
                        {user.name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                </div>

                <Link
                  href={dashboardHref}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/50 dark:hover:bg-white/5"
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                  Dashboard
                </Link>
                <Link
                  href={settingsHref}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/50 dark:hover:bg-white/5"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  Settings
                </Link>

                <hr className="border-white/10 mx-4 my-2" />

                <button
                  onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="px-4 space-y-2">
                <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                  <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-white/50 dark:hover:bg-white/5">
                    Sign in
                  </button>
                </Link>
                <Link href="/auth/register" onClick={() => setMenuOpen(false)}>
                  <button className="cta-btn-primary w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl">
                    Get started <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
