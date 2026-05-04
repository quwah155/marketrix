import { ProductCard } from "@/components/marketplace/product-card";
import { SearchBar } from "@/components/marketplace/search-bar";
import { CategoryFilter } from "@/components/marketplace/category-filter";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Store,
  Zap,
  Shield,
  TrendingUp,
  Code2,
  BookOpen,
  Layers,
  Package,
  ArrowRight,
  Star,
  CheckCircle2,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getHomepageProducts } from "@/services/public-query.service";

export const metadata: Metadata = {
  title: "Marketrix — Premium Digital Products Marketplace",
  description:
    "Discover top-rated digital products: templates, courses, software & more from verified vendors on Marketrix.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const features = [
  {
    icon: Shield,
    title: "Stripe-Secured Payments",
    desc: "Every transaction is encrypted and protected by Stripe's industry-leading security infrastructure.",
  },
  {
    icon: CheckCircle2,
    title: "Verified Vendors Only",
    desc: "Every seller passes our multi-step verification before listing. Zero spam. Zero fakes.",
  },
  {
    icon: Zap,
    title: "Instant Digital Delivery",
    desc: "Products are delivered the moment payment is confirmed. Download files instantly, globally.",
  },
  {
    icon: Globe,
    title: "Global Marketplace",
    desc: "Buy and sell across 150+ countries with multi-currency support and localized pricing.",
  },
  {
    icon: TrendingUp,
    title: "Vendor Analytics",
    desc: "Real-time dashboards for vendors to track revenue, conversions, and product performance.",
  },
  {
    icon: Star,
    title: "Ratings & Reviews",
    desc: "Community-driven ratings ensure you always know what you're getting before you buy.",
  },
];

const categories = [
  { icon: Code2, label: "Software & SaaS", href: "/products?category=SOFTWARE", color: "#e1ff51" },
  { icon: BookOpen, label: "Courses", href: "/products?category=COURSES", color: "#80ffb0" },
  { icon: Layers, label: "Templates", href: "/products?category=TEMPLATES", color: "#51d0ff" },
  { icon: Package, label: "Digital Assets", href: "/products?category=OTHER", color: "#ff9b51" },
];

const steps = [
  { number: "01", title: "Browse & Discover", desc: "Search thousands of verified digital products with smart filters and AI-powered recommendations." },
  { number: "02", title: "Secure Checkout", desc: "Complete your purchase with Stripe-powered secure checkout. Multiple payment methods accepted." },
  { number: "03", title: "Download Instantly", desc: "Access your product immediately after payment. No waiting, no delays, just instant delivery." },
];

const marqueeItems = [
  "✦ Secure Payments", "✦ Instant Delivery", "✦ Verified Vendors",
  "✦ 50K+ Buyers", "✦ Global Marketplace", "✦ 5K+ Products",
  "✦ Stripe Powered", "✦ AI Search", "✦ 24/7 Support",
  "✦ Secure Payments", "✦ Instant Delivery", "✦ Verified Vendors",
  "✦ 50K+ Buyers", "✦ Global Marketplace", "✦ 5K+ Products",
  "✦ Stripe Powered", "✦ AI Search", "✦ 24/7 Support",
];

export default async function HomePage(props: PageProps) {
  const searchParams = await props.searchParams;
  return (
    <>
      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-28 sm:py-36"
        style={{ background: "#00272c" }}
      >
        {/* Grid background */}
        <div className="absolute inset-0 hero-grid-bg animate-grid-pulse" />

        {/* Glowing orbs */}
        <div
          className="hero-glow-orb absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px]"
          style={{ background: "rgba(225,255,81,0.08)" }}
        />
        <div
          className="hero-glow-orb absolute bottom-0 right-0 w-[350px] h-[350px]"
          style={{ background: "rgba(0,200,180,0.07)" }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-8 stat-badge">
            <Zap className="h-3.5 w-3.5" style={{ color: "#e1ff51" }} />
            <span style={{ color: "#e1ff51" }}>10,000+ digital products available</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.08] tracking-tight">
            The Marketplace<br />
            for{" "}
            <span className="gradient-text">Premium Digital</span>
            <br />Products
          </h1>

          <p className="text-lg text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            Templates, courses, software, and graphics from verified creators.
            <br className="hidden sm:block" />
            Launch faster. Build smarter. Grow bigger.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/products">
              <button className="cta-btn-primary px-8 py-3.5 text-base rounded-xl flex items-center gap-2">
                Browse Products <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link href="/auth/register?role=VENDOR">
              <button className="cta-btn-outline px-8 py-3.5 text-base rounded-xl">
                Start Selling Free
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16">
            {[
              { value: "5K+", label: "Products" },
              { value: "2K+", label: "Vendors" },
              { value: "50K+", label: "Buyers" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p
                  className="text-3xl font-extrabold tracking-tight"
                  style={{ color: "#e1ff51" }}
                >
                  {stat.value}
                </p>
                <p className="text-sm text-white/50 mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MARQUEE STRIP
      ══════════════════════════════════════════ */}
      <div
        className="overflow-hidden py-3 border-y"
        style={{
          background: "rgba(225,255,81,0.06)",
          borderColor: "rgba(225,255,81,0.12)",
        }}
      >
        <div className="flex animate-marquee whitespace-nowrap">
          {marqueeItems.map((item, i) => (
            <span
              key={i}
              className="mx-6 text-sm font-semibold"
              style={{ color: "rgba(225,255,81,0.75)" }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          CATEGORY CARDS
      ══════════════════════════════════════════ */}
      <section className="py-20" style={{ background: "#001a1f" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Shop by <span className="gradient-text">Category</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Explore our curated collection of premium digital products across every niche.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map(({ icon: Icon, label, href, color }) => (
              <Link href={href} key={label}>
                <div
                  className="tech-card p-6 text-center cursor-pointer group"
                  style={{ background: "rgba(0,39,44,0.7)" }}
                >
                  <div
                    className="h-12 w-12 rounded-xl mx-auto mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `${color}15`, border: `1px solid ${color}30` }}
                  >
                    <Icon className="h-6 w-6" style={{ color }} />
                  </div>
                  <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                    {label}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES GRID
      ══════════════════════════════════════════ */}
      <section className="py-24" style={{ background: "#00272c" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4 stat-badge" style={{ color: "#e1ff51" }}>
              WHY MARKETRIX
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Built for the <span className="gradient-text">Modern Creator</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Everything you need to buy, sell, and deliver digital products at scale.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="tech-card p-6">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(225,255,81,0.1)", border: "1px solid rgba(225,255,81,0.2)" }}
                >
                  <Icon className="h-5 w-5" style={{ color: "#e1ff51" }} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section className="py-24" style={{ background: "#001a1f" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4 stat-badge" style={{ color: "#e1ff51" }}>
              HOW IT WORKS
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Three steps to <span className="gradient-text">success</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div
              className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(225,255,81,0.3), transparent)" }}
            />
            {steps.map(({ number, title, desc }, i) => (
              <div key={number} className="text-center relative">
                {/* Number badge */}
                <div
                  className="inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-6 text-2xl font-black"
                  style={{
                    background: i === 0 ? "#e1ff51" : "rgba(225,255,81,0.08)",
                    color: i === 0 ? "#00272c" : "#e1ff51",
                    border: "1px solid rgba(225,255,81,0.3)",
                  }}
                >
                  {number}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════ */}
      <section className="py-20" style={{ background: "#00272c" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div
            className="rounded-3xl p-12 relative overflow-hidden"
            style={{
              background: "#e1ff51",
              boxShadow: "0 0 80px rgba(225,255,81,0.25)",
            }}
          >
            {/* Subtle grid pattern on CTA */}
            <div
              className="absolute inset-0 rounded-3xl opacity-10"
              style={{
                backgroundImage: "linear-gradient(rgba(0,39,44,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,39,44,0.8) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: "#00272c" }}>
                Ready to start selling?
              </h2>
              <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: "rgba(0,39,44,0.7)" }}>
                Join thousands of verified vendors earning on Marketrix. List your first product for free, no upfront cost.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth/register?role=VENDOR">
                  <button
                    className="px-8 py-3.5 rounded-xl text-base font-bold transition-all duration-200 hover:opacity-90 hover:-translate-y-1"
                    style={{ background: "#00272c", color: "#e1ff51" }}
                  >
                    Become a Vendor
                  </button>
                </Link>
                <Link href="/products">
                  <button
                    className="px-8 py-3.5 rounded-xl text-base font-semibold border transition-all duration-200 hover:-translate-y-1"
                    style={{ borderColor: "rgba(0,39,44,0.4)", color: "#00272c" }}
                  >
                    Browse Products
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MARKETPLACE SECTION
      ══════════════════════════════════════════ */}
      <section className="marketplace-section py-16" style={{ background: "#001a1f" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-1" style={{ color: "hsl(var(--foreground))" }}>
              Featured <span className="gradient-text">Products</span>
            </h2>
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Hand-picked by our editorial team</p>
          </div>

          {/* Search & Filters */}
          <div className="mb-10 space-y-4">
            <Suspense fallback={<div className="h-10 w-full max-w-xl bg-muted animate-pulse rounded-xl" />}>
              <SearchBar />
            </Suspense>
            <Suspense fallback={<div className="h-8 w-full bg-muted/50 animate-pulse rounded-xl" />}>
              <CategoryFilter />
            </Suspense>
          </div>

          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
    </>
  );
}

async function ProductGrid({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { products, total, params } = await getHomepageProducts(searchParams);
  const totalPages = Math.ceil(total / 12);

  if (products.length === 0) {
    return (
      <div className="text-center py-24">
        <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2 text-white">No products found</h3>
        <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
        <Link href="/">
          <Button variant="secondary">Clear filters</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {total} product{total !== 1 ? "s" : ""} found
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product as Parameters<typeof ProductCard>[0]["product"]}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          {params.page > 1 && (
            <Link
              href={`?${new URLSearchParams({
                ...(searchParams as Record<string, string>),
                page: String(params.page - 1),
              })}`}
            >
              <Button variant="secondary" size="sm">Previous</Button>
            </Link>
          )}
          <span className="text-sm text-muted-foreground px-4">
            Page {params.page} of {totalPages}
          </span>
          {params.page < totalPages && (
            <Link
              href={`?${new URLSearchParams({
                ...(searchParams as Record<string, string>),
                page: String(params.page + 1),
              })}`}
            >
              <Button variant="secondary" size="sm">Next</Button>
            </Link>
          )}
        </div>
      )}
    </>
  );
}
