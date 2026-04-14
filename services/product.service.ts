import { ProductStatus, Role } from "@/types/db";
import type { ApiResponse } from "@/types";
import { slugify } from "@/lib/utils";
import { productRepository } from "@/server/repositories/product.repository";
import { vendorProfileRepository } from "@/server/repositories/vendor-profile.repository";

export async function createVendorProduct(input: {
  userId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  status: ProductStatus;
  fileUrl?: string;
  previewUrl?: string;
  thumbnail?: string;
}): Promise<ApiResponse<{ id: string; slug: string }>> {
  const vendorProfile = await vendorProfileRepository.findByUserId(input.userId);
  if (!vendorProfile) {
    return { success: false, error: "Vendor profile not found" };
  }

  let slug = slugify(input.title);
  const existing = await productRepository.findBySlug(slug);
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  const product = await productRepository.create({
    title: input.title,
    description: input.description,
    price: input.price,
    category: input.category,
    status: input.status,
    slug,
    vendorId: vendorProfile.id,
    fileUrl: input.fileUrl || null,
    previewUrl: input.previewUrl || null,
    thumbnail: input.thumbnail || null,
  });

  return { success: true, data: { id: product.id, slug: product.slug } };
}

export async function updateVendorProduct(input: {
  productId: string;
  userId: string;
  userRole: Role;
  title: string;
  description: string;
  price: number;
  category: string;
  status: ProductStatus;
  fileUrl?: string;
  previewUrl?: string;
  thumbnail?: string;
}): Promise<ApiResponse<{ id: string; slug: string }>> {
  const product = await productRepository.findByIdWithVendor(input.productId);
  if (!product) return { success: false, error: "Product not found" };

  if (input.userRole !== Role.ADMIN && product.vendor.userId !== input.userId) {
    return { success: false, error: "You don't own this product" };
  }

  const updated = await productRepository.update(input.productId, {
    title: input.title,
    description: input.description,
    price: input.price,
    category: input.category,
    status: input.status,
    fileUrl: input.fileUrl || null,
    previewUrl: input.previewUrl || null,
    thumbnail: input.thumbnail || null,
  });

  return { success: true, data: { id: updated.id, slug: updated.slug } };
}

export async function deleteVendorProduct(input: {
  productId: string;
  userId: string;
  userRole: Role;
}): Promise<ApiResponse<null>> {
  const product = await productRepository.findByIdWithVendor(input.productId);
  if (!product) return { success: false, error: "Product not found" };

  if (input.userRole !== Role.ADMIN && product.vendor.userId !== input.userId) {
    return { success: false, error: "You don't own this product" };
  }

  await productRepository.delete(input.productId);
  return { success: true, data: null, message: "Product deleted" };
}

export async function setProductStatus(
  productId: string,
  status: ProductStatus
): Promise<ApiResponse<null>> {
  await productRepository.updateStatus(productId, status);
  return { success: true, data: null };
}
