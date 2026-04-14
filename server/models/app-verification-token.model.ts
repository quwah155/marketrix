import { Schema, model, models } from "mongoose";

const AppVerificationTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    type: { type: String, default: "EMAIL_VERIFICATION" },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "app_verification_tokens",
  }
);

AppVerificationTokenSchema.virtual("id").get(function () {
  return this._id.toString();
});

export const AppVerificationTokenModel =
  models.AppVerificationToken || model("AppVerificationToken", AppVerificationTokenSchema);

