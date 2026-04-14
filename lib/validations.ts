import { z } from "zod";
import { ProductCategory, ProductStatus, Role } from "@/types/db";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID");

// ================================
// Auth Schemas
// ================================
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(["BUYER", "VENDOR"]).default("BUYER"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ================================
// Product Schemas
// ================================
export const productSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000),
  price: z.coerce
    .number()
    .positive("Price must be positive")
    .max(9999, "Price cannot exceed $9,999"),
  category: z.nativeEnum(ProductCategory),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
  fileUrl: z.string().url("Invalid file URL").optional().or(z.literal("")),
  previewUrl: z
    .string()
    .url("Invalid preview URL")
    .optional()
    .or(z.literal("")),
  thumbnail: z
    .string()
    .url("Invalid thumbnail URL")
    .optional()
    .or(z.literal("")),
});

export type ProductFormValues = z.infer<typeof productSchema>;

// ================================
// Review Schema
// ================================
export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  productId: objectIdSchema,
});

// ================================
// Message Schema
// ================================
export const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(2000),
  threadId: objectIdSchema,
});

// ================================
// Vendor Profile Schema
// ================================
export const vendorProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  avatar: z.string().url().optional().or(z.literal("")),
});

// ================================
// Admin Schemas
// ================================
export const updateUserRoleSchema = z.object({
  userId: objectIdSchema,
  role: z.nativeEnum(Role),
});

// ================================
// Search & Filter Schema
// ================================
export const productSearchSchema = z.object({
  q: z.string().optional(),
  category: z.nativeEnum(ProductCategory).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z
    .enum(["trending", "newest", "price_asc", "price_desc"])
    .default("trending"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});
