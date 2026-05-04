import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="page-shell flex min-h-screen items-center justify-center p-8">
      <div className="glass-card mx-auto max-w-2xl rounded-[2rem] p-10 text-center">
        <div className="relative mb-8">
          <p className="select-none text-9xl font-black text-muted/30">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="h-16 w-16 text-brand-500/60" />
          </div>
        </div>
        <h1 className="mb-3 text-3xl font-bold">Page not found</h1>
        <p className="mx-auto mb-8 max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist, moved, or is no longer available.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/">
            <Button leftIcon={<Home className="h-4 w-4" />}>Go Home</Button>
          </Link>
          <Link href="/products">
            <Button variant="secondary">Browse Marketplace</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
