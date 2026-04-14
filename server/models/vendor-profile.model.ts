import { Schema, model, models } from "mongoose";

const VendorProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    bio: { type: String },
    avatar: { type: String },
    verified: { type: Boolean, default: false },
    balance: { type: Number, default: 0 },
    website: { type: String },
    stripeAccountId: { type: String }, // Stripe Connect for payouts
  },
  {
    timestamps: true,
    collection: "vendor_profiles",
  }
);

VendorProfileSchema.virtual("id").get(function () {
  return this._id.toString();
});

export const VendorProfileModel =
  models.VendorProfile || model("VendorProfile", VendorProfileSchema);
