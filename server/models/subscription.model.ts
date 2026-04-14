import { Schema, model, models } from "mongoose";
import { SubscriptionStatus } from "@/types/db";

const SubscriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    stripeSubscriptionId: { type: String, unique: true, sparse: true },
    stripePriceId: { type: String },
    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.TRIALING,
      index: true,
    },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: "subscriptions",
  }
);

SubscriptionSchema.virtual("id").get(function () {
  return this._id.toString();
});

export const SubscriptionModel =
  models.Subscription || model("Subscription", SubscriptionSchema);

