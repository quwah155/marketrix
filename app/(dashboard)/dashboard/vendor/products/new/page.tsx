import { requireVendor } from "@/server/guards/auth.guard";
import { ProductForm } from "@/components/vendor/product-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NewProductPage() {
  await requireVendor();

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/vendor/products">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create Product</h1>
          <p className="text-muted-foreground">Fill in the details for your new digital product</p>
        </div>
      </div>
      <ProductForm />
    </div>
  );
}
