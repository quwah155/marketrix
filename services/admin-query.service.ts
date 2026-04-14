import { OrderStatus } from "@/types/db";
import { connectToDatabase } from "@/lib/mongoose";
import {
  OrderModel,
  ProductModel,
  ReviewModel,
  UserModel,
  VendorProfileModel,
} from "@/server/models";
import { normalizeDoc, normalizeDocs } from "@/server/models/helpers";

type ObjectIdLike = { toString(): string };
type UserDoc = Record<string, unknown> & { _id: ObjectIdLike };
type VendorProfileDoc = Record<string, unknown> & {
  _id: ObjectIdLike;
  userId: ObjectIdLike;
};
type ProductDoc = Record<string, unknown> & {
  _id: ObjectIdLike;
  vendorId: ObjectIdLike;
};
type OrderDoc = Record<string, unknown> & {
  buyerId?: unknown;
  productId?: unknown;
};

export async function getAdminUsersData() {
  await connectToDatabase();
  const users = await UserModel.find().sort({ createdAt: -1 }).lean({ virtuals: true }) as unknown as UserDoc[];

  const vendorProfiles = await VendorProfileModel.find({
    userId: { $in: users.map((u: UserDoc) => u._id) },
  })
    .select({ verified: 1, balance: 1, userId: 1 })
    .lean({ virtuals: true }) as unknown as VendorProfileDoc[];

  const vendorMap = new Map(
    vendorProfiles.map((profile: VendorProfileDoc) => [
      profile.userId.toString(),
      normalizeDoc(profile),
    ])
  );

  const usersWithCounts = await Promise.all(
    users.map(async (user: UserDoc) => {
      const ordersCount = await OrderModel.countDocuments({ buyerId: user._id });
      return {
        ...user,
        vendorProfile: vendorMap.get(user._id.toString()) ?? null,
        _count: { orders: ordersCount },
      };
    })
  );

  return normalizeDocs(usersWithCounts);
}

export async function getAdminProductsData() {
  await connectToDatabase();
  const products = await ProductModel.find().sort({ createdAt: -1 }).lean({ virtuals: true }) as unknown as ProductDoc[];

  const vendorProfiles = await VendorProfileModel.find({
    _id: { $in: products.map((p: ProductDoc) => p.vendorId) },
  })
    .select({ userId: 1, verified: 1 })
    .lean({ virtuals: true }) as unknown as VendorProfileDoc[];

  const vendorUsers = await UserModel.find({
    _id: { $in: vendorProfiles.map((v: VendorProfileDoc) => v.userId) },
  })
    .select({ name: 1 })
    .lean({ virtuals: true }) as unknown as UserDoc[];

  const vendorUserMap = new Map(
    vendorUsers.map((user: UserDoc) => [user._id.toString(), normalizeDoc(user)])
  );

  const vendorMap = new Map(
    vendorProfiles.map((profile: VendorProfileDoc) => [
      profile._id.toString(),
      {
        ...(normalizeDoc(profile) as Record<string, unknown>),
        user: vendorUserMap.get(profile.userId.toString()) ?? null,
      },
    ])
  );

  const productsWithCounts = await Promise.all(
    products.map(async (product: ProductDoc) => {
      const [ordersCount, reviewsCount] = await Promise.all([
        OrderModel.countDocuments({ productId: product._id }),
        ReviewModel.countDocuments({ productId: product._id }),
      ]);
      return {
        ...product,
        vendor: vendorMap.get(product.vendorId.toString()) ?? null,
        _count: { orders: ordersCount, reviews: reviewsCount },
      };
    })
  );

  return normalizeDocs(productsWithCounts);
}

export async function getAdminOrdersData() {
  await connectToDatabase();
  const orders = await OrderModel.find()
    .populate({ path: "buyerId", select: { name: 1, email: 1 } })
    .populate({
      path: "productId",
      select: { title: 1, vendorId: 1 },
      populate: {
        path: "vendorId",
        populate: { path: "userId", select: { name: 1 } },
      },
    })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean({ virtuals: true }) as unknown as OrderDoc[];

  return normalizeDocs(
    orders.map((order: OrderDoc) => {
      const product = order.productId as Record<string, unknown>;
      const vendor = product?.vendorId as Record<string, unknown> | undefined;
      const vendorUser = vendor?.userId as Record<string, unknown> | undefined;
      return {
        ...order,
        buyer: normalizeDoc(order.buyerId as Record<string, unknown>),
        product: {
          id: product?._id?.toString(),
          title: product?.title,
          vendor: { user: { name: vendorUser?.name ?? null } },
        },
      };
    })
  );
}

export async function getAdminAnalyticsData() {
  await connectToDatabase();
  const [revenueAgg, feesAgg, completedOrders, refundedOrders] = await Promise.all([
    OrderModel.aggregate([
      { $match: { status: OrderStatus.COMPLETED } },
      { $group: { _id: null, amount: { $sum: "$amount" } } },
    ]),
    OrderModel.aggregate([
      { $match: { status: OrderStatus.COMPLETED } },
      { $group: { _id: null, platformFee: { $sum: "$platformFee" } } },
    ]),
    OrderModel.countDocuments({ status: OrderStatus.COMPLETED }),
    OrderModel.countDocuments({ status: OrderStatus.REFUNDED }),
  ]);

  return {
    revenue: { _sum: { amount: revenueAgg[0]?.amount ?? 0 } },
    fees: { _sum: { platformFee: feesAgg[0]?.platformFee ?? 0 } },
    completedOrders,
    refundedOrders,
  };
}

export async function getAdminDisputesData() {
  await connectToDatabase();
  const orders = await OrderModel.find({
    status: { $in: [OrderStatus.FAILED, OrderStatus.REFUNDED] },
  })
    .populate({ path: "buyerId", select: { name: 1, email: 1 } })
    .populate({
      path: "productId",
      select: { title: 1, vendorId: 1 },
      populate: {
        path: "vendorId",
        populate: { path: "userId", select: { name: 1 } },
      },
    })
    .sort({ updatedAt: -1 })
    .limit(100)
    .lean({ virtuals: true }) as unknown as OrderDoc[];

  return normalizeDocs(
    orders.map((order: OrderDoc) => {
      const product = order.productId as Record<string, unknown>;
      const vendor = product?.vendorId as Record<string, unknown> | undefined;
      const vendorUser = vendor?.userId as Record<string, unknown> | undefined;
      return {
        ...order,
        buyer: normalizeDoc(order.buyerId as Record<string, unknown>),
        product: {
          id: product?._id?.toString(),
          title: product?.title,
          vendor: { user: { name: vendorUser?.name ?? null } },
        },
      };
    })
  );
}
