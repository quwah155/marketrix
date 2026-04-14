import { Schema, model, models } from "mongoose";

const MessageSchema = new Schema(
  {
    threadId: {
      type: Schema.Types.ObjectId,
      ref: "MessageThread",
      required: true,
      index: true,
    },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "messages",
  }
);

MessageSchema.virtual("id").get(function () {
  return this._id.toString();
});

export const MessageModel = models.Message || model("Message", MessageSchema);

