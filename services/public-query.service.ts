import { ProductStatus } from "@/types/db";
import { connectToDatabase } from "@/lib/mongoose";
import { OrderModel, ProductModel, ReviewModel } from "@/server/models";
import { productSearchSchema } from "@/lib/validations";

type RawSearchParams = Record<string, string | string[] | undefined>;

type AggregatedProduct = {
  _id: unknown;
  title: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  fileUrl?: string | null;
  previewUrl?: string | null;
  thumbnail?: string | null;
  status: string;
  views: number;
  createdAt: Date;
  vendorId: unknown;
  ordersCount?: number;
  reviewsCount?: number;
  reviews?: Array<{ rating: number }>;
  vendor?: { _id: unknown; verified?: boolean; userId?: unknown };
  vendorUser?: { _id: unknown; name?: string | null; image?: string | null };
};

function mapAggregatedProduct(product: AggregatedProduct) {
  const vendorUser = product.vendorUser
    ? {
        id: product.vendorUser._id?.toString(),
        name: product.vendorUser.name ?? null,
        image: product.vendorUser.image ?? null,
      }
    : null;

  const vendor = product.vendor
    ? {
        id: product.vendor._id?.toString(),
        user: vendorUser,
        verified: product.vendor.verified ?? false,
      }
    : null;

  return {
    id: product._id?.toString(),
    title: product.title,
    slug: product.slug,
    description: product.description,
    price: product.price,
    category: product.category,
    fileUrl: product.fileUrl ?? null,
    previewUrl: product.previewUrl ?? null,
    thumbnail: product.thumbnail ?? null,
    status: product.status,
    views: product.views,
    createdAt: product.createdAt,
    vendorId: product.vendorId?.toString() ?? vendor?.id,
    vendor,
    _count: {
      orders: product.ordersCount ?? 0,
      reviews: product.reviewsCount ?? 0,
    },
    reviews: (product.reviews ?? []).map((r) => ({ rating: r.rating })),
  };
}

export async function getHomepageProducts(searchParams: RawSearchParams) {
  await connectToDatabase();
  const params = productSearchSchema.parse({
    q: searchParams.q,
    category: searchParams.category,
    minPrice: searchParams.minPrice,
    maxPrice: searchParams.maxPrice,
    sort: searchParams.sort ?? "trending",
    page: searchParams.page ?? "1",
    limit: "12",
  });

  const where: Record<string, unknown> = {
    status: ProductStatus.PUBLISHED,
  };

  if (params.q) {
    const pattern = new RegExp(params.q, "i");
    where.$or = [{ title: pattern }, { description: pattern }];
  }

  if (params.category) {
    where.category = params.category;
  }

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    where.price = {
      ...(params.minPrice !== undefined && { $gte: params.minPrice }),
      ...(params.maxPrice !== undefined && { $lte: params.maxPrice }),
    };
  }

  const sortSpec =
    params.sort === "newest"
      ? { createdAt: -1 }
      : params.sort === "price_asc"
      ? { price: 1 }
      : params.sort === "price_desc"
      ? { price: -1 }
      : { ordersCount: -1, views: -1, createdAt: -1 };

  const [products, total] = await Promise.all([
    ProductModel.aggregate<AggregatedProduct>([
      { $match: where },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "productId",
          as: "orders",
        },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "productId",
          as: "reviews",
        },
      },
      {
        $addFields: {
          ordersCount: { $size: "$orders" },
          reviewsCount: { $size: "$reviews" },
        },
      },
      {
        $lookup: {
          from: "vendor_profiles",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendor",
        },
      },
      { $unwind: "$vendor" },
      {
        $lookup: {
          from: "users",
          localField: "vendor.userId",
          foreignField: "_id",
          as: "vendorUser",
        },
      },
      { $unwind: "$vendorUser" },
      { $sort: sortSpec },
      { $skip: (params.page - 1) * params.limit },
      { $limit: params.limit },
      {
        $project: {
          title: 1,
          slug: 1,
          description: 1,
          price: 1,
          category: 1,
          fileUrl: 1,
          previewUrl: 1,
          thumbnail: 1,
          status: 1,
          views: 1,
          createdAt: 1,
          vendorId: 1,
          ordersCount: 1,
          reviewsCount: 1,
          reviews: { rating: 1 },
          vendor: { _id: 1, verified: 1, userId: 1 },
          vendorUser: { _id: 1, name: 1, image: 1 },
        },
      },
    ] as any[]),
    ProductModel.countDocuments(where),
  ]);

  return { products: products.map(mapAggregatedProduct), total, params };
}

export async function getProductMetaBySlug(slug: string) {
  await connectToDatabase();
  const product = await ProductModel.findOne({ slug })
    .select({ title: 1, description: 1, thumbnail: 1 })
    .lean({ virtuals: true }) as any;
  if (!product) return null;
  return {
    title: product.title,
    description: product.description,
    thumbnail: product.thumbnail ?? null,
  };
}

export async function getPublishedProductBySlugWithDetails(slug: string) {
  await connectToDatabase();
  const product = await ProductModel.findOne({
    slug,
    status: ProductStatus.PUBLISHED,
  })
    .populate({
      path: "vendorId",
      populate: { path: "userId", select: { name: 1, image: 1, createdAt: 1 } },
    })
    .lean({ virtuals: true }) as any;

  if (!product) return null;

  const [reviews, orderCount, reviewCount] = await Promise.all([
    ReviewModel.find({ productId: product._id })
      .populate({ path: "buyerId", select: { name: 1, image: 1 } })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean({ virtuals: true }) as any,
    OrderModel.countDocuments({ productId: product._id }),
    ReviewModel.countDocuments({ productId: product._id }),
  ]);

  const vendorRaw = product.vendorId as Record<string, unknown>;
  const vendorUserRaw = vendorRaw?.userId as Record<string, unknown> | undefined;

  const vendor = vendorRaw
    ? {
        id: vendorRaw._id?.toString(),
        verified: vendorRaw.verified ?? false,
        user: vendorUserRaw
          ? {
              id: vendorUserRaw._id?.toString(),
              name: vendorUserRaw.name ?? null,
              image: vendorUserRaw.image ?? null,
              createdAt: vendorUserRaw.createdAt,
            }
          : null,
      }
    : null;

  return {
    id: product._id?.toString(),
    title: product.title,
    slug: product.slug,
    description: product.description,
    price: product.price,
    category: product.category,
    thumbnail: product.thumbnail ?? null,
    fileUrl: product.fileUrl ?? null,
    previewUrl: product.previewUrl ?? null,
    status: product.status,
    views: product.views,
    createdAt: product.createdAt,
    vendorId: vendor?.id,
    vendor,
    reviews: reviews.map((review: Record<string, unknown>) => ({
      id: review._id?.toString(),
      rating: review.rating,
      comment: review.comment ?? null,
      createdAt: review.createdAt,
      buyer: review.buyerId
        ? (() => {
            const b = review.buyerId as Record<string, unknown>;
            return {
              id: b._id?.toString(),
              name: b.name ?? null,
              image: b.image ?? null,
            };
          })()
        : null,
    })),
    _count: {
      orders: orderCount,
      reviews: reviewCount,
    },
  };
}

export async function incrementProductViews(productId: string) {
  await connectToDatabase();
  return ProductModel.findByIdAndUpdate(productId, { $inc: { views: 1 } });
}

export async function hasUserPurchasedProduct(userId: string, productId: string) {
  await connectToDatabase();
  const order = await OrderModel.findOne({
    buyerId: userId,
    productId,
    status: "COMPLETED",
  })
    .select({ _id: 1 })
    .lean() as any;
  return !!order;
}
