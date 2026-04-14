import { requireAuth } from "@/server/guards/auth.guard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getBuyerDownloadsData } from "@/services/buyer-query.service";

export default async function BuyerDownloadsPage() {
  const user = await requireAuth();
  const { downloadableProducts } = await getBuyerDownloadsData(user.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Downloads</h1>
        <p className="text-muted-foreground">{downloadableProducts.length} purchased items available</p>
      </div>

      {downloadableProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-20 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No downloads available</h3>
            <p className="text-muted-foreground mb-6">Products you purchase with downloadable files will appear here</p>
            <Link href="/"><Button variant="secondary">Browse Products</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {downloadableProducts.map((order) => (
            <Card key={order.id} hover>
              <CardContent className="pt-5">
                <div className="relative h-32 rounded-xl overflow-hidden bg-muted mb-4">
                  {order.product.thumbnail ? (
                    <Image src={order.product.thumbnail} alt={order.product.title} fill className="object-cover" />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-semibold line-clamp-2 mb-3">{order.product.title}</h3>
                <a href={order.product.fileUrl!} download target="_blank" rel="noreferrer">
                  <Button variant="secondary" size="sm" className="w-full" leftIcon={<Download className="h-3.5 w-3.5" />}>
                    Download
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
