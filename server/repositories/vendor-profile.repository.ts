import { connectToDatabase } from "@/lib/mongoose";
import { VendorProfileModel } from "@/server/models";
import { normalizeDoc } from "@/server/models/helpers";

export const vendorProfileRepository = {
  async findByUserId(userId: string) {
    await connectToDatabase();
    const doc = await VendorProfileModel.findOne({ userId }).lean({
      virtuals: true,
    });
    return normalizeDoc(doc);
  },

  async createForUser(userId: string) {
    await connectToDatabase();
    const doc = await VendorProfileModel.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean({ virtuals: true }) as any;
    return normalizeDoc(doc);
  },

  async upsertForUser(userId: string) {
    await connectToDatabase();
    const doc = await VendorProfileModel.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId } },
      { upsert: true, new: true }
    ).lean({ virtuals: true }) as any;
    return normalizeDoc(doc);
  },

  async incrementBalance(vendorId: string, amount: number) {
    await connectToDatabase();
    const doc = await VendorProfileModel.findByIdAndUpdate(
      vendorId,
      { $inc: { balance: amount } },
      { new: true }
    ).lean({ virtuals: true }) as any;
    return normalizeDoc(doc);
  },

  async updateProfile(
    userId: string,
    data: { bio?: string; website?: string; avatar?: string }
  ) {
    await connectToDatabase();
    const doc = await VendorProfileModel.findOneAndUpdate(
      { userId },
      { $set: data },
      { new: true }
    ).lean({ virtuals: true }) as any;
    return normalizeDoc(doc);
  },
};
