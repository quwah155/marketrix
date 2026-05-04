import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandLogo({
  href = "/",
  showWordmark = true,
  compact = false,
  className,
}: {
  href?: string;
  showWordmark?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center transition-opacity hover:opacity-95",
        compact ? "gap-2" : "gap-2.5",
        className
      )}
    >
      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-chartreuse/20 bg-gunmetal-900 shadow-brand transition-all duration-200 group-hover:border-chartreuse/40">
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M3 18L3 8L8 14L11 10L14 14L19 8V18"
            stroke="#e1ff51"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="11"
            cy="5"
            r="2"
            fill="#e1ff51"
            fillOpacity="0.22"
            stroke="#e1ff51"
            strokeWidth="1.5"
          />
          <path
            d="M5 5H3M19 5H17"
            stroke="#e1ff51"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.4"
          />
        </svg>
      </div>
      {showWordmark ? (
        <span className="text-lg font-bold tracking-tight">
          <span className="text-foreground">market</span>
          <span className="text-chartreuse">rix</span>
        </span>
      ) : null}
    </Link>
  );
}
