import { SubscriptionStatus } from "@/types/db";
import { connectToDatabase } from "@/lib/mongoose";
import { SubscriptionModel } from "@/server/models";
import { normalizeDoc, normalizeDocs } from "@/server/models/helpers";

export const subscriptionRepository = {
  async findByUserId(userId: string) {
    await connectToDatabase();
    const doc = await SubscriptionModel.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean({ virtuals: true }) as any;
    return normalizeDoc(doc);
  },

  async findActiveByUserId(userId: string) {
    await connectToDatabase();
    const doc = await SubscriptionModel.findOne({
      userId,
      status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
    }).lean({ virtuals: true }) as any;
    return normalizeDoc(doc);
  },

  async findByStripeSubscriptionId(stripeSubscriptionId: string) {
    await connectToDatabase();
    const doc = await SubscriptionModel.findOne({ stripeSubscriptionId }).lean({
      virtuals: true,
    });
    return normalizeDoc(doc);
  },

  async upsertByStripeId(input: {
    userId: string;
    productId: string;
    stripeSubscriptionId: string;
    stripePriceId?: string;
    status: SubscriptionStatus;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
  }) {
    await connectToDatabase();
    const doc = await SubscriptionModel.findOneAndUpdate(
      { stripeSubscriptionId: input.stripeSubscriptionId },
      {
        $set: {
          userId: input.userId,
          productId: input.productId,
          stripePriceId: input.stripePriceId,
          status: input.status,
          currentPeriodStart: input.currentPeriodStart,
          currentPeriodEnd: input.currentPeriodEnd,
          cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
        },
        $setOnInsert: {
          stripeSubscriptionId: input.stripeSubscriptionId,
        },
      },
      { new: true, upsert: true }
    ).lean({ virtuals: true }) as any;
    return normalizeDoc(doc);
  },

  async updateStatus(
    stripeSubscriptionId: string,
    status: SubscriptionStatus,
    extras?: { cancelAtPeriodEnd?: boolean; currentPeriodEnd?: Date }
  ) {
    await connectToDatabase();
    const doc = await SubscriptionModel.findOneAndUpdate(
      { stripeSubscriptionId },
      {
        $set: {
          status,
          ...(extras?.cancelAtPeriodEnd !== undefined && {
            cancelAtPeriodEnd: extras.cancelAtPeriodEnd,
          }),
          ...(extras?.currentPeriodEnd && {
            currentPeriodEnd: extras.currentPeriodEnd,
          }),
        },
      },
      { new: true }
    ).lean({ virtuals: true }) as any;
    return normalizeDoc(doc);
  },

  async findAllByProductId(productId: string) {
    await connectToDatabase();
    const docs = await SubscriptionModel.find({ productId })
      .sort({ createdAt: -1 })
      .lean({ virtuals: true }) as any;
    return normalizeDocs(docs);
  },
};
