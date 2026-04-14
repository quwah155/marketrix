import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <div className="relative mb-8">
        <p className="text-9xl font-black text-muted/30 select-none">404</p>
        <div className="absolute inset-0 flex items-center justify-center">
          <Search className="h-16 w-16 text-brand-500/60" />
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-3">Page not found</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link href="/"><Button leftIcon={<Home className="h-4 w-4" />}>Go Home</Button></Link>
        <Link href="/products"><Button variant="secondary">Browse Marketplace</Button></Link>
      </div>
    </div>
  );
}
