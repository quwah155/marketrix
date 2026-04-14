import Link from "next/link";
import Image from "next/image";
import { formatPrice, calculateAverageRating } from "@/lib/utils";
import { Badge } from "@/components/ui/card";
import { Star, ShoppingCart } from "lucide-react";
import type { ProductWithVendor } from "@/types";

interface ProductCardProps {
  product: ProductWithVendor;
}

export function ProductCard({ product }: ProductCardProps) {
  const avgRating = calculateAverageRating(
    product.reviews?.map((r) => r.rating) ?? []
  );
  const reviewCount = product._count?.reviews ?? 0;
  const orderCount = product._count?.orders ?? 0;

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="product-card rounded-2xl border border-border bg-card overflow-hidden h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative h-48 bg-brand-50 dark:bg-brand-950/30 overflow-hidden">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-brand-200" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge variant="default" className="text-xs">
              {product.category}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 gap-3">
          {/* Vendor */}
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-full bg-brand-500 flex items-center justify-center text-white text-[10px] font-bold">
              {product.vendor.user.name?.[0]?.toUpperCase() ?? "V"}
            </div>
            <span className="text-xs text-muted-foreground truncate">
              {product.vendor.user.name}
            </span>
            {product.vendor.verified && (
              <span className="ml-auto text-xs text-emerald-500 font-medium">✓</span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-brand-500 transition-colors">
            {product.title}
          </h3>

          {/* Rating */}
          {reviewCount > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= Math.round(avgRating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {avgRating} ({reviewCount})
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between">
            <span className="text-lg font-bold text-brand-600 dark:text-brand-400">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-muted-foreground">
              {orderCount} sold
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
