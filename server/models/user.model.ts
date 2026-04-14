import { Schema, model, models } from "mongoose";
import { Role } from "@/types/db";

const UserSchema = new Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    emailVerified: { type: Date },
    passwordHash: { type: String },
    image: { type: String },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.BUYER,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

UserSchema.virtual("id").get(function () {
  return this._id.toString();
});

export const UserModel = models.User || model("User", UserSchema);

