"use server";

import { requireVendor, requireAdmin } from "@/server/guards/auth.guard";
import { productSchema } from "@/lib/validations";
import { ProductStatus, Role } from "@/types/db";
import type { ApiResponse } from "@/types";
import { revalidatePath } from "next/cache";
import {
  createVendorProduct,
  deleteVendorProduct,
  setProductStatus,
  updateVendorProduct,
} from "@/services/product.service";

export async function createProduct(
  formData: FormData
): Promise<ApiResponse<{ id: string; slug: string }>> {
  const user = await requireVendor();

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    category: formData.get("category"),
    status: formData.get("status") ?? ProductStatus.DRAFT,
    fileUrl: formData.get("fileUrl") ?? "",
    previewUrl: formData.get("previewUrl") ?? "",
    thumbnail: formData.get("thumbnail") ?? "",
  };

  const result = productSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const response = await createVendorProduct({
    userId: user.id,
    title: result.data.title,
    description: result.data.description,
    price: result.data.price,
    category: result.data.category,
    status: result.data.status,
    fileUrl: result.data.fileUrl || "",
    previewUrl: result.data.previewUrl || "",
    thumbnail: result.data.thumbnail || "",
  });
  if (!response.success) return response;

  revalidatePath("/dashboard/vendor/products");
  revalidatePath("/");

  return response;
}

export async function updateProduct(
  productId: string,
  formData: FormData
): Promise<ApiResponse<{ id: string }>> {
  const user = await requireVendor();

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    category: formData.get("category"),
    status: formData.get("status") ?? ProductStatus.DRAFT,
    fileUrl: formData.get("fileUrl") ?? "",
    previewUrl: formData.get("previewUrl") ?? "",
    thumbnail: formData.get("thumbnail") ?? "",
  };

  const result = productSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const response = await updateVendorProduct({
    productId,
    userId: user.id,
    userRole: user.role,
    title: result.data.title,
    description: result.data.description,
    price: result.data.price,
    category: result.data.category,
    status: result.data.status,
    fileUrl: result.data.fileUrl || "",
    previewUrl: result.data.previewUrl || "",
    thumbnail: result.data.thumbnail || "",
  });
  if (!response.success) return response;

  revalidatePath(`/dashboard/vendor/products/${productId}/edit`);
  revalidatePath("/dashboard/vendor/products");
  revalidatePath(`/products/${response.data.slug}`);

  return { success: true, data: { id: productId } };
}

export async function deleteProduct(
  productId: string
): Promise<ApiResponse<null>> {
  const user = await requireVendor();

  const response = await deleteVendorProduct({
    productId,
    userId: user.id,
    userRole: user.role,
  });
  if (!response.success) return response;

  revalidatePath("/dashboard/vendor/products");
  revalidatePath("/");

  return response;
}

export async function suspendProduct(
  productId: string
): Promise<ApiResponse<null>> {
  await requireAdmin();
  const result = await setProductStatus(productId, ProductStatus.SUSPENDED);
  if (!result.success) return result;
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true, data: null, message: "Product suspended" };
}

export async function restoreProduct(
  productId: string
): Promise<ApiResponse<null>> {
  await requireAdmin();
  const result = await setProductStatus(productId, ProductStatus.PUBLISHED);
  if (!result.success) return result;
  revalidatePath("/admin/products");
  return { success: true, data: null };
}
