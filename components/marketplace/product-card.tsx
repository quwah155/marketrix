import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { Badge } from "@/components/ui/card";
import { calculateAverageRating, formatPrice } from "@/lib/utils";
import type { ProductWithVendor } from "@/types";

interface ProductCardProps {
  product: ProductWithVendor;
}

export function ProductCard({ product }: ProductCardProps) {
  const avgRating = calculateAverageRating(product.reviews?.map((review) => review.rating) ?? []);
  const reviewCount = product._count?.reviews ?? 0;
  const orderCount = product._count?.orders ?? 0;
  const vendorImage = product.vendor.avatar ?? product.vendor.user.image;

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="product-card glass-card flex h-full flex-col overflow-hidden rounded-[1.4rem]">
        <div className="image-glass relative h-48 overflow-hidden rounded-b-[1.2rem]" style={{ background: "rgba(0,39,44,0.06)" }}>
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
              <ShoppingCart className="h-12 w-12" style={{ color: "rgba(0,39,44,0.25)" }} />
            </div>
          )}

          <div className="absolute left-3 top-3">
            <Badge variant="default" className="text-xs">
              {product.category}
            </Badge>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-center gap-1.5">
            <div
              className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
              style={{ background: "#00272c", color: "#e1ff51" }}
            >
              {vendorImage ? (
                <Image
                  src={vendorImage}
                  alt={product.vendor.user.name ?? "Vendor"}
                  width={20}
                  height={20}
                  className="h-5 w-5 rounded-full object-cover"
                />
              ) : (
                product.vendor.user.name?.[0]?.toUpperCase() ?? "V"
              )}
            </div>
            <span className="truncate text-xs font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
              {product.vendor.user.name}
            </span>
            {product.vendor.verified ? (
              <span className="ml-auto text-xs font-medium text-emerald-400">
                Verified
              </span>
            ) : null}
          </div>

          <h3
            className="line-clamp-2 text-sm font-semibold leading-snug transition-colors"
            style={{ color: "hsl(var(--card-foreground))" }}
          >
            {product.title}
          </h3>

          {reviewCount > 0 ? (
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
              <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                {avgRating} ({reviewCount})
              </span>
            </div>
          ) : null}

          <div className="mt-auto flex items-center justify-between">
            <span className="text-lg font-bold" style={{ color: "hsl(var(--primary))" }}>
              {formatPrice(product.price)}
            </span>
            <span className="text-xs font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
              {orderCount} sold
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
