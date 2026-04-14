import { ProductStatus } from "@/types/db";
import { connectToDatabase } from "@/lib/mongoose";
import { ProductModel } from "@/server/models";
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

export async function getMarketplaceProducts(searchParams: RawSearchParams) {
  await connectToDatabase();
  const params = productSearchSchema.parse({
    q: searchParams.q,
    category: searchParams.category,
    minPrice: searchParams.minPrice,
    maxPrice: searchParams.maxPrice,
    sort: searchParams.sort ?? "trending",
    page: searchParams.page ?? "1",
    limit: "16",
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
