import { OrderStatus, ProductStatus } from "@/types/db";
import { connectToDatabase } from "@/lib/mongoose";
import {
  MessageThreadModel,
  MessageModel,
  OrderModel,
  ProductModel,
  ReviewModel,
  VendorProfileModel,
} from "@/server/models";
import { normalizeDoc, normalizeDocs } from "@/server/models/helpers";
import { messageThreadRepository } from "@/server/repositories/message-thread.repository";

export async function getVendorDashboardData(userId: string) {
  await connectToDatabase();
  const vendorProfileDoc = await VendorProfileModel.findOne({ userId }).lean({
    virtuals: true,
  }) as any;

  if (!vendorProfileDoc) return null;

  const vendorObjectId = vendorProfileDoc._id;
  const allProductIds = await ProductModel.find({ vendorId: vendorObjectId })
    .select({ _id: 1 })
    .lean() as any;

  const productsRaw = await ProductModel.find({ vendorId: vendorObjectId })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean({ virtuals: true }) as any;

  const products = await Promise.all(
    productsRaw.map(async (product: any) => {
      const [ordersCount, reviewsCount] = await Promise.all([
        OrderModel.countDocuments({ productId: product._id }),
        ReviewModel.countDocuments({ productId: product._id }),
      ]);
      return {
        ...product,
        _count: { orders: ordersCount, reviews: reviewsCount },
      };
    })
  );

  const vendorProfile = {
    ...normalizeDoc(vendorProfileDoc),
    products: normalizeDocs(products),
  };

  const [totalRevenueAgg, totalOrders, totalViewsAgg, recentOrdersRaw] =
    await Promise.all([
      OrderModel.aggregate([
        {
          $match: {
            status: OrderStatus.COMPLETED,
            productId: { $in: allProductIds.map((p: any) => p._id) },
          },
        },
        { $group: { _id: null, vendorEarning: { $sum: "$vendorEarning" } } },
      ]),
      OrderModel.countDocuments({
        status: OrderStatus.COMPLETED,
        productId: { $in: allProductIds.map((p: any) => p._id) },
      }),
      ProductModel.aggregate([
        { $match: { vendorId: (vendorProfileDoc as any)._id } },
        { $group: { _id: null, views: { $sum: "$views" } } },
      ]),
      OrderModel.find({
        status: OrderStatus.COMPLETED,
        productId: { $in: allProductIds.map((p: any) => p._id) },
      })
        .populate({ path: "productId", select: { title: 1 } })
        .populate({ path: "buyerId", select: { name: 1, email: 1 } })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean({ virtuals: true }) as any,
    ]);

  const recentOrders = normalizeDocs(
    recentOrdersRaw.map((order: any) => ({
      ...order,
      product: normalizeDoc(order.productId as Record<string, unknown>),
      buyer: normalizeDoc(order.buyerId as Record<string, unknown>),
    }))
  );

  return {
    vendorProfile,
    totalRevenue: { _sum: { vendorEarning: totalRevenueAgg[0]?.vendorEarning ?? 0 } },
    totalOrders,
    totalViews: { _sum: { views: totalViewsAgg[0]?.views ?? 0 } },
    recentOrders,
  };
}

export async function getVendorAnalyticsData(userId: string) {
  await connectToDatabase();
  const vendorProfileDoc = await VendorProfileModel.findOne({ userId }).lean({
    virtuals: true,
  }) as any;
  if (!vendorProfileDoc) return null;

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const productIds = await ProductModel.find({ vendorId: vendorProfileDoc._id })
    .select({ _id: 1 })
    .lean() as any;

  const [ordersRaw, topProductsRaw, totalViewsAgg] = await Promise.all([
    OrderModel.find({
      status: OrderStatus.COMPLETED,
      createdAt: { $gte: sixMonthsAgo },
      productId: { $in: productIds.map((p: any) => p._id) },
    })
      .populate({ path: "productId", select: { title: 1, vendorId: 1 } })
      .sort({ createdAt: 1 })
      .lean({ virtuals: true }) as any,
    ProductModel.find({ vendorId: vendorProfileDoc._id })
      .sort({ views: -1 })
      .limit(5)
      .lean({ virtuals: true }) as any,
    ProductModel.aggregate([
      { $match: { vendorId: vendorProfileDoc._id } },
      { $group: { _id: null, views: { $sum: "$views" } } },
    ]),
  ]);

  const topProducts = await Promise.all(
    topProductsRaw.map(async (product: any) => {
      const ordersCount = await OrderModel.countDocuments({ productId: product._id });
      return {
        ...product,
        _count: { orders: ordersCount },
      };
    })
  );

  return {
    vendorProfile: normalizeDoc(vendorProfileDoc),
    orders: normalizeDocs(
      ordersRaw.map((order: any) => ({
        ...order,
        product: normalizeDoc(order.productId as Record<string, unknown>),
      }))
    ),
    topProducts: normalizeDocs(topProducts),
    totalViews: { _sum: { views: totalViewsAgg[0]?.views ?? 0 } },
  };
}

export async function getVendorBalanceData(userId: string) {
  await connectToDatabase();
  const vendorProfileDoc = await VendorProfileModel.findOne({ userId }).lean({
    virtuals: true,
  }) as any;
  if (!vendorProfileDoc) return null;

  const products = await ProductModel.find({ vendorId: vendorProfileDoc._id })
    .select({ _id: 1 })
    .lean() as any;

  const completedOrdersRaw = await OrderModel.find({
    status: OrderStatus.COMPLETED,
    productId: { $in: products.map((p: any) => p._id) },
  })
    .populate({ path: "productId", select: { title: 1 } })
    .populate({ path: "buyerId", select: { name: 1 } })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean({ virtuals: true }) as any;

  const completedOrders = normalizeDocs(
    completedOrdersRaw.map((order: any) => ({
      ...order,
      product: normalizeDoc(order.productId as Record<string, unknown>),
      buyer: normalizeDoc(order.buyerId as Record<string, unknown>),
    }))
  );

  return { vendorProfile: normalizeDoc(vendorProfileDoc), completedOrders };
}

export async function getVendorOrdersData(userId: string) {
  await connectToDatabase();
  const vendorProfileDoc = await VendorProfileModel.findOne({ userId }).lean({
    virtuals: true,
  }) as any;
  if (!vendorProfileDoc) return null;

  const products = await ProductModel.find({ vendorId: vendorProfileDoc._id })
    .select({ _id: 1 })
    .lean() as any;

  const productIds = products.map((product: { _id: unknown }) => product._id);

  const [ordersRaw, pendingOrders, completedOrders, refundedOrders, failedOrders] =
    await Promise.all([
      OrderModel.find({
        productId: { $in: productIds },
      })
        .populate({ path: "productId", select: { title: 1, slug: 1, thumbnail: 1 } })
        .populate({ path: "buyerId", select: { name: 1, email: 1 } })
        .sort({ createdAt: -1 })
        .lean({ virtuals: true }) as any,
      OrderModel.countDocuments({
        productId: { $in: productIds },
        status: OrderStatus.PENDING,
      }),
      OrderModel.countDocuments({
        productId: { $in: productIds },
        status: OrderStatus.COMPLETED,
      }),
      OrderModel.countDocuments({
        productId: { $in: productIds },
        status: OrderStatus.REFUNDED,
      }),
      OrderModel.countDocuments({
        productId: { $in: productIds },
        status: OrderStatus.FAILED,
      }),
    ]);

  const orders = normalizeDocs(
    ordersRaw.map((order: any) => ({
      ...order,
      product: normalizeDoc(order.productId as Record<string, unknown>),
      buyer: normalizeDoc(order.buyerId as Record<string, unknown>),
    })),
  );

  return {
    vendorProfile: normalizeDoc(vendorProfileDoc),
    orders,
    stats: {
      total: orders.length,
      pending: pendingOrders,
      completed: completedOrders,
      refunded: refundedOrders,
      failed: failedOrders,
    },
  };
}

export async function getVendorProductsData(userId: string) {
  await connectToDatabase();
  const vendorProfileDoc = await VendorProfileModel.findOne({ userId }).lean({
    virtuals: true,
  }) as any;
  if (!vendorProfileDoc) return null;

  const productsRaw = await ProductModel.find({ vendorId: vendorProfileDoc._id })
    .sort({ createdAt: -1 })
    .lean({ virtuals: true }) as any;

  const products = await Promise.all(
    productsRaw.map(async (product: any) => {
      const [ordersCount, reviewsCount] = await Promise.all([
        OrderModel.countDocuments({ productId: product._id }),
        ReviewModel.countDocuments({ productId: product._id }),
      ]);
      return {
        ...product,
        _count: { orders: ordersCount, reviews: reviewsCount },
      };
    })
  );

  return { vendorProfile: normalizeDoc(vendorProfileDoc), products: normalizeDocs(products) };
}

export async function getVendorProductForEdit(userId: string, productId: string) {
  await connectToDatabase();
  const vendorProfileDoc = await VendorProfileModel.findOne({ userId }).lean({
    virtuals: true,
  }) as any;
  if (!vendorProfileDoc) return null;

  const product = await ProductModel.findOne({
    _id: productId,
    vendorId: vendorProfileDoc._id,
  }).lean({ virtuals: true }) as any;

  return normalizeDoc(product);
}

export async function getVendorSettingsProfile(userId: string) {
  await connectToDatabase();
  const profile = await VendorProfileModel.findOne({ userId })
    .select({ verified: 1, bio: 1, website: 1 })
    .lean({ virtuals: true }) as any;
  return normalizeDoc(profile);
}

export async function getVendorMessagesData(userId: string, activeThreadId?: string) {
  const threads = await messageThreadRepository.findForUserWithLastMessage(userId);
  const activeThread = activeThreadId
    ? await messageThreadRepository.findByIdForUserWithMessages(activeThreadId, userId)
    : null;

  return { threads, activeThread };
}

export function getProductStatusVariant(status: ProductStatus) {
  if (status === ProductStatus.PUBLISHED) return "success";
  if (status === ProductStatus.DRAFT) return "secondary";
  return "danger";
}
