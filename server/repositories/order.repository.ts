import { OrderStatus } from "@/types/db";
import { connectToDatabase } from "@/lib/mongoose";
import { OrderModel, VendorProfileModel } from "@/server/models";
import { normalizeDoc } from "@/server/models/helpers";

export const orderRepository = {
  async findCompletedByBuyerAndProduct(buyerId: string, productId: string) {
    await connectToDatabase();
    const doc = await OrderModel.findOne({
      buyerId,
      productId,
      status: OrderStatus.COMPLETED,
    }).lean({ virtuals: true }) as any;
    return normalizeDoc(doc);
  },

  async createPending(input: {
    buyerId: string;
    productId: string;
    amount: number;
    platformFee: number;
    vendorEarning: number;
  }) {
    await connectToDatabase();
    const doc = await OrderModel.create({
      ...input,
      status: OrderStatus.PENDING,
    });
    return normalizeDoc(doc.toObject());
  },

  async linkStripeSession(orderId: string, stripeSessionId: string) {
    await connectToDatabase();
    const doc = await OrderModel.findByIdAndUpdate(
      orderId,
      { stripeSessionId },
      { new: true }
    ).lean({ virtuals: true }) as any;
    return normalizeDoc(doc);
  },

  async findById(orderId: string) {
    await connectToDatabase();
    const doc = await OrderModel.findById(orderId).lean({ virtuals: true }) as any;
    return normalizeDoc(doc);
  },

  async markPendingFailed(orderId: string) {
    await connectToDatabase();
    return OrderModel.updateMany(
      { _id: orderId, status: OrderStatus.PENDING },
      { status: OrderStatus.FAILED }
    );
  },

  async completeAndCreditVendor(input: {
    orderId: string;
    platformFee: number;
    vendorEarning: number;
    stripeSessionId: string;
    vendorId: string;
  }) {
    await connectToDatabase();
    const order = await OrderModel.findOneAndUpdate(
      { _id: input.orderId, status: OrderStatus.PENDING },
      {
        status: OrderStatus.COMPLETED,
        platformFee: input.platformFee,
        vendorEarning: input.vendorEarning,
        stripeSessionId: input.stripeSessionId,
      },
      { new: true }
    ).lean({ virtuals: true }) as any;

    if (!order) return null;

    await VendorProfileModel.findByIdAndUpdate(input.vendorId, {
      $inc: { balance: input.vendorEarning },
    });

    return normalizeDoc(order);
  },

  async findCompletedPurchase(buyerId: string, productId: string) {
    await connectToDatabase();
    const doc = await OrderModel.findOne({
      buyerId,
      productId,
      status: OrderStatus.COMPLETED,
    }).lean({ virtuals: true }) as any;
    return normalizeDoc(doc);
  },

  async updateStatus(orderId: string, status: OrderStatus) {
    await connectToDatabase();
    const doc = await OrderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    )
      .select({ _id: 1, status: 1 })
      .lean({ virtuals: true }) as any;
    if (!doc) return null;
    return { id: doc.id ?? doc._id?.toString(), status: doc.status } as {
      id: string;
      status: OrderStatus;
    };
  },
};
