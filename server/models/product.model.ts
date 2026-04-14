import { Schema, model, models } from "mongoose";
import { ProductCategory, ProductStatus } from "@/types/db";

const ProductSchema = new Schema(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: "VendorProfile", required: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
      type: String,
      enum: Object.values(ProductCategory),
      required: true,
      index: true,
    },
    fileUrl: { type: String },
    previewUrl: { type: String },
    thumbnail: { type: String },
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.DRAFT,
      index: true,
    },
    views: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: "products",
  }
);

ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ price: 1 });

ProductSchema.virtual("id").get(function () {
  return this._id.toString();
});

export const ProductModel = models.Product || model("Product", ProductSchema);
