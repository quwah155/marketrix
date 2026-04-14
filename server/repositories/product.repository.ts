import { ProductStatus } from "@/types/db";
import { connectToDatabase } from "@/lib/mongoose";
import { ProductModel } from "@/server/models";
import { normalizeDoc } from "@/server/models/helpers";

export const productRepository = {
  async findBySlug(slug: string) {
    await connectToDatabase();
    const doc = await ProductModel.findOne({ slug }).lean({ virtuals: true }) as any;
    return normalizeDoc(doc);
  },

  async findByIdWithVendor(productId: string) {
    await connectToDatabase();
    const doc = await ProductModel.findById(productId)
      .populate("vendorId")
      .lean({ virtuals: true }) as any;
    if (!doc) return null;
    const vendorRaw = doc.vendorId as Record<string, unknown>;
    const vendor = normalizeDoc(vendorRaw);
    return normalizeDoc({
      ...doc,
      vendor: vendor
        ? { ...vendor, userId: vendorRaw?.userId?.toString() }
        : vendor,
    });
  },

  async findPublishedByIdWithVendorUser(productId: string) {
    await connectToDatabase();
    const doc = await ProductModel.findOne({
      _id: productId,
      status: ProductStatus.PUBLISHED,
    })
      .populate({
        path: "vendorId",
        populate: { path: "userId" },
      })
      .lean({ virtuals: true }) as any;
    if (!doc) return null;
    const vendorRaw = doc.vendorId as Record<string, unknown>;
    const vendor = normalizeDoc(vendorRaw);
    const vendorUserRaw = vendorRaw?.userId as Record<string, unknown> | undefined;
    const vendorUser = vendorUserRaw ? normalizeDoc(vendorUserRaw) : null;
    return normalizeDoc({
      ...doc,
      vendor: vendor
        ? { ...vendor, user: vendorUser, userId: vendorRaw?.userId?.toString() }
        : null,
      vendorId: vendor?.id ?? doc.vendorId,
    });
  },

  async create(data: {
    vendorId: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    category: string;
    status: ProductStatus;
    fileUrl?: string | null;
    previewUrl?: string | null;
    thumbnail?: string | null;
  }) {
    await connectToDatabase();
    const doc = await ProductModel.create(data);
    return normalizeDoc(doc.toObject());
  },

  async update(
    productId: string,
    data: Partial<{
      title: string;
      description: string;
      price: number;
      category: string;
      status: ProductStatus;
      fileUrl?: string | null;
      previewUrl?: string | null;
      thumbnail?: string | null;
    }>
  ) {
    await connectToDatabase();
    const doc = await ProductModel.findByIdAndUpdate(productId, data, {
      new: true,
    }).lean({ virtuals: true }) as any;
    return normalizeDoc(doc);
  },

  async updateStatus(productId: string, status: ProductStatus) {
    await connectToDatabase();
    const doc = await ProductModel.findByIdAndUpdate(
      productId,
      { status },
      { new: true }
    ).lean({ virtuals: true }) as any;
    return normalizeDoc(doc);
  },

  async delete(productId: string) {
    await connectToDatabase();
    return ProductModel.findByIdAndDelete(productId);
  },
};
