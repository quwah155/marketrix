import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, formatDate, calculateAverageRating } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge, Card, CardContent } from "@/components/ui/card";
import { Star, Package, ShieldCheck, Download, MessageSquare } from "lucide-react";
import type { Metadata } from "next";
import type { ProductWithVendor } from "@/types";
import { CheckoutButton } from "@/components/marketplace/checkout-button";
import {
  getProductMetaBySlug,
  getPublishedProductBySlugWithDetails,
  hasUserPurchasedProduct,
  incrementProductViews,
} from "@/services/public-query.service";

type ProductReview = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  buyer: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
};

type ProductDetail = Omit<ProductWithVendor, "vendor" | "reviews"> & {
  vendor: ProductWithVendor["vendor"] | null;
  reviews: ProductReview[];
  _count: {
    orders: number;
    reviews: number;
  };
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const product = await getProductMetaBySlug(params.slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.title,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.title,
      description: product.description.slice(0, 160),
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  };
}

export default async function ProductDetailPage(props: Props) {
  const params = await props.params;
  const [product, session] = await Promise.all([
    getPublishedProductBySlugWithDetails(params.slug),
    getServerSession(authOptions),
  ]);

  if (!product) notFound();

  const productDetail = product as ProductDetail;
  const vendor = productDetail.vendor;
  const vendorUser = vendor?.user ?? null;

  incrementProductViews(productDetail.id).catch(() => {});

  let hasPurchased = false;
  if (session?.user) {
    hasPurchased = await hasUserPurchasedProduct(session.user.id, productDetail.id);
  }

  const avgRating = calculateAverageRating(
    productDetail.reviews.map((review) => review.rating)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {productDetail.thumbnail && (
            <div className="relative h-72 overflow-hidden rounded-2xl sm:h-96">
              <Image
                src={productDetail.thumbnail}
                alt={productDetail.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge>{productDetail.category}</Badge>
              {productDetail._count.reviews > 0 && (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(avgRating)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground">
                    {avgRating} ({productDetail._count.reviews} reviews)
                  </span>
                </div>
              )}
            </div>
            <h1 className="mb-2 text-2xl font-bold sm:text-3xl">{productDetail.title}</h1>
            <p className="text-sm text-muted-foreground">
              Published {formatDate(productDetail.createdAt)} | {productDetail._count.orders} purchases
              {" | "}
              {productDetail.views.toLocaleString()} views
            </p>
          </div>

          <div className="prose max-w-none dark:prose-invert">
            <h2 className="mb-3 text-lg font-semibold">About this product</h2>
            <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
              {productDetail.description}
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold">
              Reviews ({productDetail._count.reviews})
            </h2>
            {productDetail.reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {productDetail.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-5">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                          {review.buyer?.name?.[0]?.toUpperCase() ?? "B"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <p className="text-sm font-medium">
                              {review.buyer?.name ?? "Buyer"}
                            </p>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${
                                    star <= review.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "fill-muted text-muted"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardContent className="space-y-5 pt-6">
              <div>
                <span className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                  {formatPrice(productDetail.price)}
                </span>
                <p className="mt-1 text-xs text-muted-foreground">One-time purchase</p>
              </div>

              {hasPurchased ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                    You own this product
                  </div>
                  <Link href="/dashboard/buyer/downloads">
                    <Button variant="success" className="w-full">
                      <Download className="h-4 w-4" />
                      Access Downloads
                    </Button>
                  </Link>
                </div>
              ) : (
                <CheckoutButton productId={productDetail.id} isLoggedIn={!!session?.user} />
              )}

              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" /> Secure payment via Stripe
                </li>
                <li className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-brand-500" /> Instant digital delivery
                </li>
                <li className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-500" /> Lifetime access
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <h3 className="mb-3 text-sm font-semibold">About the Vendor</h3>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 font-bold text-white">
                  {vendorUser?.name?.[0]?.toUpperCase() ?? "V"}
                </div>
                <div>
                  <p className="text-sm font-medium">{vendorUser?.name ?? "Vendor"}</p>
                  {vendor?.verified && (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-500">
                      <ShieldCheck className="h-3 w-3" /> Verified Vendor
                    </span>
                  )}
                </div>
              </div>
              {session?.user && vendorUser && session.user.id !== vendorUser.id && (
                <Link href={`/dashboard/buyer/messages?vendor=${vendorUser.id}`}>
                  <Button variant="secondary" size="sm" className="w-full">
                    <MessageSquare className="h-4 w-4" />
                    Message Vendor
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
