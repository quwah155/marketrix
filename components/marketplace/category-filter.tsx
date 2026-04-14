"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ProductCategory } from "@/types/db";

const CATEGORIES: { label: string; value: ProductCategory | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Software", value: ProductCategory.SOFTWARE },
  { label: "eBooks", value: ProductCategory.EBOOKS },
  { label: "Courses", value: ProductCategory.COURSES },
  { label: "Templates", value: ProductCategory.TEMPLATES },
  { label: "Graphics", value: ProductCategory.GRAPHICS },
  { label: "Audio", value: ProductCategory.AUDIO },
  { label: "Video", value: ProductCategory.VIDEO },
  { label: "Other", value: ProductCategory.OTHER },
];

const SORT_OPTIONS = [
  { label: "Trending", value: "trending" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "ALL";
  const activeSort = searchParams.get("sort") ?? "trending";

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL" || value === "trending") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Categories */}
      <div className="flex gap-1.5 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setParam("category", cat.value)}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-150",
              activeCategory === cat.value
                ? "bg-brand-500 text-white shadow-brand-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="ml-auto">
        <select
          value={activeSort}
          onChange={(e) => setParam("sort", e.target.value)}
          className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
