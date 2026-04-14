import { Schema, model, models } from "mongoose";
import { OrderStatus } from "@/types/db";

const OrderSchema = new Schema(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    amount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    vendorEarning: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
      index: true,
    },
    stripeSessionId: { type: String, unique: true, sparse: true },
  },
  {
    timestamps: true,
    collection: "orders",
  }
);

OrderSchema.index({ createdAt: -1 });

OrderSchema.virtual("id").get(function () {
  return this._id.toString();
});

export const OrderModel = models.Order || model("Order", OrderSchema);

