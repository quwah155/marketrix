import { Suspense } from "react";
import { ProductCard } from "@/components/marketplace/product-card";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { SearchBar } from "@/components/marketplace/search-bar";
import { CategoryFilter } from "@/components/marketplace/category-filter";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { getMarketplaceProducts } from "@/services/marketplace.service";

export const metadata: Metadata = {
  title: "Marketplace — quwahmarket-saas",
  description: "Browse thousands of premium digital products: templates, courses, software, and more.",
};

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function ProductsPage({ searchParams }: Props) {
  return (
    <>
      {/* Header */}
      <div className="border-b border-border bg-surface-secondary dark:bg-surface-dark-secondary py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
          <p className="text-muted-foreground">Discover premium digital products from verified vendors</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <Suspense fallback={<div className="h-10 w-full max-w-xl bg-muted animate-pulse rounded-xl" />}>
            <SearchBar />
          </Suspense>
          <Suspense fallback={<div className="h-8 w-full bg-muted/50 animate-pulse rounded-xl" />}>
            <CategoryFilter />
          </Suspense>
        </div>

        <Suspense fallback={<ProductGridSkeleton count={16} />}>
          <ProductGrid searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function ProductGrid({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const { products, total, params } = await getMarketplaceProducts(searchParams);
  const totalPages = Math.ceil(total / 16);

  if (products.length === 0) {
    return (
      <div className="text-center py-24">
        <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms</p>
        <Link href="/products"><Button variant="secondary">Clear filters</Button></Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{(params.page - 1) * 16 + 1}–{Math.min(params.page * 16, total)}</span> of{" "}
          <span className="font-semibold text-foreground">{total}</span> products
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product as Parameters<typeof ProductCard>[0]["product"]} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
          {params.page > 1 && (
            <Link href={`?${new URLSearchParams({ ...searchParams as Record<string, string>, page: String(params.page - 1) })}`}>
              <Button variant="secondary" size="sm">← Previous</Button>
            </Link>
          )}
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const pg = Math.max(1, Math.min(params.page - 3, totalPages - 6)) + i;
            return (
              <Link key={pg} href={`?${new URLSearchParams({ ...searchParams as Record<string, string>, page: String(pg) })}`}>
                <Button variant={pg === params.page ? "primary" : "secondary"} size="sm">{pg}</Button>
              </Link>
            );
          })}
          {params.page < totalPages && (
            <Link href={`?${new URLSearchParams({ ...searchParams as Record<string, string>, page: String(params.page + 1) })}`}>
              <Button variant="secondary" size="sm">Next →</Button>
            </Link>
          )}
        </div>
      )}
    </>
  );
}
