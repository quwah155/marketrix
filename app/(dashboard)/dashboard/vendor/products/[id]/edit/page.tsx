import { requireVendor } from "@/server/guards/auth.guard";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/vendor/product-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getVendorProductForEdit } from "@/services/vendor-query.service";

interface Props { params: { id: string } }

export default async function EditProductPage({ params }: Props) {
  const user = await requireVendor();
  const product = await getVendorProductForEdit(user.id, params.id);
  if (!product) notFound();

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/vendor/products">
          <Button variant="ghost" size="icon-sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground">{product.title}</p>
        </div>
      </div>
      <ProductForm
        productId={product.id}
        defaultValues={{
          title: product.title,
          description: product.description,
          price: product.price,
          category: product.category,
          status: product.status,
          fileUrl: product.fileUrl ?? "",
          previewUrl: product.previewUrl ?? "",
          thumbnail: product.thumbnail ?? "",
        }}
      />
    </div>
  );
}
