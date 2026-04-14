import { Schema, model, models } from "mongoose";

const SessionSchema = new Schema(
  {
    sessionToken: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    expires: { type: Date, required: true },
  },
  {
    timestamps: false,
    collection: "sessions",
  }
);

SessionSchema.virtual("id").get(function () {
  return this._id.toString();
});

export const SessionModel = models.Session || model("Session", SessionSchema);

