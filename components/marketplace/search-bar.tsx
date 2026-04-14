"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useCallback, useState, useTransition } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  const handleSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (term) {
        params.set("q", term);
        params.set("page", "1");
      } else {
        params.delete("q");
      }
      startTransition(() => router.push(`?${params.toString()}`));
    },
    [router, searchParams]
  );

  return (
    <div className="max-w-xl">
      <Input
        placeholder="Search products..."
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (e.target.value === "" || e.target.value.length > 2) {
            handleSearch(e.target.value);
          }
        }}
        leftIcon={
          isPending ? (
            <div className="h-4 w-4 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )
        }
      />
    </div>
  );
}
