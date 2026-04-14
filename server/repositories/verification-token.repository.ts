import { connectToDatabase } from "@/lib/mongoose";
import { AppVerificationTokenModel } from "@/server/models";
import { normalizeDoc } from "@/server/models/helpers";

export const verificationTokenRepository = {
  async findByToken(token: string) {
    await connectToDatabase();
    const doc = await AppVerificationTokenModel.findOne({ token }).lean({
      virtuals: true,
    });
    return normalizeDoc(doc);
  },

  async create(input: {
    userId: string;
    token: string;
    expiresAt: Date;
    type?: string;
  }) {
    await connectToDatabase();
    const doc = await AppVerificationTokenModel.create({
      userId: input.userId,
      token: input.token,
      expiresAt: input.expiresAt,
      type: input.type,
    });
    return normalizeDoc(doc.toObject());
  },

  async deleteById(id: string) {
    await connectToDatabase();
    return AppVerificationTokenModel.findByIdAndDelete(id);
  },

  async deletePasswordResetByUser(userId: string) {
    await connectToDatabase();
    return AppVerificationTokenModel.deleteMany({
      userId,
      type: "PASSWORD_RESET",
    });
  },
};
