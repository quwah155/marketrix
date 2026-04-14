import { Schema, model, models } from "mongoose";

const MessageThreadSchema = new Schema(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  {
    timestamps: true,
    collection: "message_threads",
  }
);

MessageThreadSchema.index({ buyerId: 1, vendorId: 1 }, { unique: true });

MessageThreadSchema.virtual("messages", {
  ref: "Message",
  localField: "_id",
  foreignField: "threadId",
});

MessageThreadSchema.virtual("id").get(function () {
  return this._id.toString();
});

export const MessageThreadModel =
  models.MessageThread || model("MessageThread", MessageThreadSchema);

