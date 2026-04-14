import { Schema, model, models } from "mongoose";

const ReviewSchema = new Schema(
  {
    rating: { type: Number, required: true },
    comment: { type: String },
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
  },
  {
    timestamps: true,
    collection: "reviews",
  }
);

ReviewSchema.index({ buyerId: 1, productId: 1 }, { unique: true });

ReviewSchema.virtual("id").get(function () {
  return this._id.toString();
});

export const ReviewModel = models.Review || model("Review", ReviewSchema);

