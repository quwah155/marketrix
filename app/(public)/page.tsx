import { ProductCard } from "@/components/marketplace/product-card";
import { SearchBar } from "@/components/marketplace/search-bar";
import { CategoryFilter } from "@/components/marketplace/category-filter";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Store, Zap, Shield, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getHomepageProducts } from "@/services/public-query.service";

export const metadata: Metadata = {
  title: "quwahmarket-saas — Premium Digital Products Marketplace",
  description: "Discover top-rated digital products: templates, courses, software & more from verified vendors.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage(props: PageProps) {
  const searchParams = await props.searchParams;
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-purple-950 py-24 sm:py-32">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-brand-500/20 blur-[120px]" />
          <div className="absolute -bottom-1/4 right-0 w-[400px] h-[400px] rounded-full bg-purple-500/15 blur-[80px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-300 mb-8">
            <Zap className="h-3.5 w-3.5" />
            10,000+ digital products available
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            The Marketplace for{" "}
            <span className="gradient-text">Premium Digital</span>{" "}
            Products
          </h1>
          <p className="text-lg text-brand-200 mb-10 max-w-2xl mx-auto">
            Templates, courses, software, and graphics from verified creators.
            Launch faster. Build smarter.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/products">
              <Button size="lg" className="bg-white text-brand-600 hover:bg-brand-50 shadow-brand-lg w-full sm:w-auto">
                Browse Products
              </Button>
            </Link>
            <Link href="/auth/register?role=VENDOR">
              <Button variant="outline" size="lg" className="border-brand-400/50 text-white hover:bg-brand-500/20 w-full sm:w-auto">
                Start Selling
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { value: "5K+", label: "Products" },
              { value: "2K+", label: "Vendors" },
              { value: "50K+", label: "Buyers" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-brand-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="border-b border-border bg-surface-secondary dark:bg-surface-dark-secondary py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            {[
              { icon: Shield, label: "Secure payments via Stripe" },
              { icon: Store, label: "Verified vendors only" },
              { icon: TrendingUp, label: "Instant digital delivery" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-brand-500" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
      </section>
    </>
  );
}

async function ProductGrid({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const { products, total, params } = await getHomepageProducts(searchParams);
  const totalPages = Math.ceil(total / 12);

  if (products.length === 0) {
    return (
      <div className="text-center py-24">
        <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground mb-6">
          Try adjusting your search or filters
        </p>
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
          <ProductCard key={product.id} product={product as Parameters<typeof ProductCard>[0]["product"]} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          {params.page > 1 && (
            <Link href={`?${new URLSearchParams({ ...searchParams as Record<string,string>, page: String(params.page - 1) })}`}>
              <Button variant="secondary" size="sm">Previous</Button>
            </Link>
          )}
          <span className="text-sm text-muted-foreground px-4">
            Page {params.page} of {totalPages}
          </span>
          {params.page < totalPages && (
            <Link href={`?${new URLSearchParams({ ...searchParams as Record<string,string>, page: String(params.page + 1) })}`}>
              <Button variant="secondary" size="sm">Next</Button>
            </Link>
          )}
        </div>
      )}
    </>
  );
}
