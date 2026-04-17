"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormValues } from "@/lib/validations";
import { createProduct, updateProduct } from "@/server/actions/product.actions";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { ProductCategory, ProductStatus } from "@/types/db";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { ImageIcon, FileUp, Save } from "lucide-react";

interface ProductFormProps {
  productId?: string;
  defaultValues?: Partial<ProductFormValues>;
}

const CATEGORIES = Object.values(ProductCategory).map((v) => ({ value: v, label: v.charAt(0) + v.slice(1).toLowerCase() }));
const STATUSES = [
  { value: ProductStatus.DRAFT, label: "Draft" },
  { value: ProductStatus.PUBLISHED, label: "Published" },
];

export function ProductForm({ productId, defaultValues }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(defaultValues?.thumbnail ?? "");
  const [fileUrl, setFileUrl] = useState(defaultValues?.fileUrl ?? "");

  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: ProductStatus.DRAFT,
      category: ProductCategory.SOFTWARE,
      ...defaultValues,
    },
  });

  async function onSubmit(data: ProductFormValues) {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => formData.append(k, String(v ?? "")));
      formData.set("thumbnail", thumbnailUrl);
      formData.set("fileUrl", fileUrl);

      const result = productId
        ? await updateProduct(productId, formData)
        : await createProduct(formData);

      if (!result.success) {
        toast.error(result.error);
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            toast.error(`${field}: ${messages[0]}`);
          });
        }
        return;
      }

      toast.success(productId ? "Product updated!" : "Product created!");
      router.push("/dashboard/vendor/products");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main fields */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardContent className="pt-6 space-y-5">
              <Input
                label="Product Title"
                placeholder="e.g. Next.js SaaS Starter Kit"
                error={errors.title?.message}
                {...register("title")}
              />
              <Textarea
                label="Description"
                placeholder="Describe your product in detail..."
                className="min-h-[200px]"
                error={errors.description?.message}
                {...register("description")}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Price (USD)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="29.00"
                  error={errors.price?.message}
                  {...register("price")}
                />
                <Select
                  label="Category"
                  options={CATEGORIES}
                  error={errors.category?.message}
                  {...register("category")}
                />
              </div>
              <Select
                label="Status"
                options={STATUSES}
                error={errors.status?.message}
                {...register("status")}
              />
            </CardContent>
          </Card>

          {/* Digital file upload */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-medium mb-3">Product File</p>
              {fileUrl ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                  <FileUp className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm text-emerald-700 dark:text-emerald-300 truncate">{fileUrl}</span>
                  <button type="button" onClick={() => setFileUrl("")} className="ml-auto text-xs text-red-500 hover:underline">Remove</button>
                </div>
              ) : (
                <UploadButton<OurFileRouter, "productFile">
                  endpoint="productFile"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClientUploadComplete={(res: any) => {
                    if (res?.[0]?.url) { setFileUrl(res[0].url); toast.success("File uploaded!"); }
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onUploadError={(err: any) => { toast.error("Upload failed: " + err.message); }}
                  appearance={{
                    button: "bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl px-4 py-2 text-sm",
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: thumbnail + settings */}
        <div className="space-y-5">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-medium mb-3">Thumbnail Image</p>
              {thumbnailUrl ? (
                <div className="space-y-3">
                  <div className="relative h-40 rounded-xl overflow-hidden">
                    <Image src={thumbnailUrl} alt="Thumbnail" fill className="object-cover" />
                  </div>
                  <button type="button" onClick={() => setThumbnailUrl("")} className="text-xs text-red-500 hover:underline">Remove</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="h-40 rounded-xl border-2 border-dashed border-border flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <UploadButton<OurFileRouter, "productThumbnail">
                    endpoint="productThumbnail"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onClientUploadComplete={(res: any) => {
                      if (res?.[0]?.url) { setThumbnailUrl(res[0].url); toast.success("Thumbnail uploaded!"); }
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onUploadError={(err: any) => { toast.error("Upload failed: " + err.message); }}
                    appearance={{
                      button: "bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl px-4 py-2 text-sm w-full",
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" isLoading={loading} leftIcon={<Save className="h-4 w-4" />}>
            {productId ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </div>
    </form>
  );
}
