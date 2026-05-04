import { Role } from "@/types/db";
import { connectToDatabase } from "@/lib/mongoose";
import { UserModel } from "@/server/models";
import { normalizeDoc } from "@/server/models/helpers";

export const userRepository = {
  async findByEmail(email: string) {
    await connectToDatabase();
    const doc = await UserModel.findOne({ email }).lean({ virtuals: true }) as any;
    return normalizeDoc(doc);
  },

  async findById(id: string) {
    await connectToDatabase();
    const doc = await UserModel.findById(id).lean({ virtuals: true }) as any;
    return normalizeDoc(doc);
  },

  async create(input: {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
  }) {
    await connectToDatabase();
    const doc = await UserModel.create(input);
    return normalizeDoc(doc.toObject());
  },

  async deleteById(userId: string) {
    await connectToDatabase();
    return UserModel.findByIdAndDelete(userId);
  },

  async updateProfile(
    userId: string,
    data: { name?: string; bio?: string; image?: string | null }
  ) {
    await connectToDatabase();
    const update: Record<string, unknown> = {};

    if (data.name !== undefined) update.name = data.name;
    if (data.bio !== undefined) update.bio = data.bio;
    if (data.image !== undefined) update.image = data.image;

    const doc = await UserModel.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true }
    ).lean({ virtuals: true }) as any;
    return normalizeDoc(doc);
  },

  async updateRole(userId: string, role: Role) {
    await connectToDatabase();
    const doc = await UserModel.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).lean({ virtuals: true }) as any;
    return normalizeDoc(doc);
  },

  async markEmailVerified(userId: string) {
    await connectToDatabase();
    const doc = await UserModel.findByIdAndUpdate(
      userId,
      { emailVerified: new Date() },
      { new: true }
    ).lean({ virtuals: true }) as any;
    return normalizeDoc(doc);
  },

  async updatePassword(userId: string, passwordHash: string) {
    await connectToDatabase();
    const doc = await UserModel.findByIdAndUpdate(
      userId,
      { passwordHash },
      { new: true }
    ).lean({ virtuals: true }) as any;
    return normalizeDoc(doc);
  },
};
