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
