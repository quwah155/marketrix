"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldX, ArrowLeft, Home } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-950 mb-6">
        <ShieldX className="h-10 w-10 text-red-500" />
      </div>
      <h1 className="text-3xl font-bold mb-3">Access Denied</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        You don&apos;t have permission to view this page. If you think this is a mistake, please contact support.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => history.back()} variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />}>Go Back</Button>
        <Link href="/"><Button leftIcon={<Home className="h-4 w-4" />}>Go Home</Button></Link>
      </div>
    </div>
  );
}
