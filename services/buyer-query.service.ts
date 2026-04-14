import { OrderStatus } from "@/types/db";
import { connectToDatabase } from "@/lib/mongoose";
import { Types } from "mongoose";
import {
  MessageModel,
  MessageThreadModel,
  OrderModel,
  ReviewModel,
} from "@/server/models";
import { normalizeDoc, normalizeDocs } from "@/server/models/helpers";
import { messageThreadRepository } from "@/server/repositories/message-thread.repository";

export async function getBuyerDashboardData(userId: string) {
  await connectToDatabase();
  const buyerObjectId = Types.ObjectId.isValid(userId)
    ? new Types.ObjectId(userId)
    : null;
  const [totalOrders, pendingOrders, totalSpentAgg] = await Promise.all([
    OrderModel.countDocuments({ buyerId: userId, status: OrderStatus.COMPLETED }),
    OrderModel.countDocuments({ buyerId: userId, status: OrderStatus.PENDING }),
    OrderModel.aggregate([
      {
        $match: buyerObjectId
          ? { buyerId: buyerObjectId, status: OrderStatus.COMPLETED }
          : { buyerId: userId, status: OrderStatus.COMPLETED },
      },
      { $group: { _id: null, amount: { $sum: "$amount" } } },
    ]),
  ]);

  const threadIds = await MessageThreadModel.find({ buyerId: userId })
    .select({ _id: 1 })
    .lean() as any;
  const unreadMessages = threadIds.length
    ? await MessageModel.countDocuments({
        threadId: { $in: threadIds.map((t: { _id: unknown }) => t._id) },
        read: false,
        senderId: { $ne: userId },
      })
    : 0;

  const recentOrdersRaw = await OrderModel.find({ buyerId: userId })
    .populate({ path: "productId", select: { title: 1, thumbnail: 1, slug: 1 } })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean({ virtuals: true }) as any;

  const recentOrders = normalizeDocs(
    recentOrdersRaw.map((order: Record<string, unknown>) => ({
      ...order,
      product: normalizeDoc(order.productId as Record<string, unknown>),
    }))
  );

  return {
    totalOrders,
    pendingOrders,
    totalSpent: { _sum: { amount: totalSpentAgg[0]?.amount ?? 0 } },
    unreadMessages,
    recentOrders,
  };
}

export async function getBuyerOrdersData(userId: string) {
  await connectToDatabase();
  const orders = await OrderModel.find({ buyerId: userId })
    .populate({
      path: "productId",
      select: { title: 1, slug: 1, thumbnail: 1, category: 1 },
      populate: {
        path: "vendorId",
        populate: { path: "userId", select: { name: 1 } },
      },
    })
    .sort({ createdAt: -1 })
    .lean({ virtuals: true }) as any;

  return normalizeDocs(
    orders.map((order: Record<string, unknown>) => {
      const product = order.productId as Record<string, unknown>;
      const vendor = product?.vendorId as Record<string, unknown> | undefined;
      const vendorUser = vendor?.userId as Record<string, unknown> | undefined;
      return {
        ...order,
        product: {
          id: product?._id?.toString(),
          title: product?.title,
          slug: product?.slug,
          thumbnail: product?.thumbnail ?? null,
          category: product?.category,
          vendor: {
            user: {
              name: vendorUser?.name ?? null,
            },
          },
        },
      };
    })
  );
}

export async function getBuyerDownloadsData(userId: string) {
  await connectToDatabase();
  const completedOrders = await OrderModel.find({
    buyerId: userId,
    status: OrderStatus.COMPLETED,
  })
    .populate({
      path: "productId",
      select: { id: 1, title: 1, slug: 1, thumbnail: 1, fileUrl: 1, category: 1 },
    })
    .sort({ createdAt: -1 })
    .lean({ virtuals: true }) as any;

  const normalizedOrders = normalizeDocs(
    completedOrders.map((order: Record<string, unknown>) => ({
      ...order,
      product: normalizeDoc(order.productId as Record<string, unknown>),
    }))
  );

  const downloadableProducts = normalizedOrders.filter((order) => order.product.fileUrl);
  return { completedOrders: normalizedOrders, downloadableProducts };
}

export async function getBuyerReviewsData(userId: string) {
  await connectToDatabase();
  const orders = await OrderModel.find({
    buyerId: userId,
    status: OrderStatus.COMPLETED,
  })
    .populate({ path: "productId", select: { title: 1, slug: 1 } })
    .sort({ createdAt: -1 })
    .lean({ virtuals: true }) as any;

  const uniqueOrders: typeof orders = [];
  const seen = new Set<string>();
  for (const order of orders) {
    const productId = (order.productId as Record<string, unknown>)?._id?.toString();
    if (!productId || seen.has(productId)) continue;
    seen.add(productId);
    uniqueOrders.push(order);
  }

  const productIds = uniqueOrders
    .map((order: Record<string, unknown>) => (order.productId as Record<string, unknown>)?._id?.toString())
    .filter(Boolean);

  const existingReviews = await ReviewModel.find({
    buyerId: userId,
    productId: { $in: productIds },
  })
    .select({ productId: 1, rating: 1, comment: 1 })
    .lean({ virtuals: true }) as any;

  return {
    orders: normalizeDocs(
      uniqueOrders.map((order: Record<string, unknown>) => ({
        ...order,
        product: normalizeDoc(order.productId as Record<string, unknown>),
      }))
    ),
    existingReviews: normalizeDocs(existingReviews),
  };
}

export async function getBuyerMessagesData(userId: string, activeThreadId?: string) {
  const threads = await messageThreadRepository.findForUserWithLastMessage(userId);
  const activeThread = activeThreadId
    ? await messageThreadRepository.findByIdForUserWithMessages(activeThreadId, userId)
    : null;

  return { threads, activeThread };
}
