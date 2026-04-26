import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/redis";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function getRequestHost(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-host") ?? req.headers.get("host");
}

// Trusted origins: the deployment URL + any explicitly configured app URL
const TRUSTED_ORIGINS = new Set(
  [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXTAUTH_URL,
    "https://marketrix-coral.vercel.app",
  ]
    .filter(Boolean)
    .map((u) => {
      try {
        return new URL(u!).origin;
      } catch {
        return null;
      }
    })
    .filter(Boolean) as string[]
);

export function validateSameOrigin(req: NextRequest): boolean {
  if (SAFE_METHODS.has(req.method.toUpperCase())) {
    return true;
  }

  const origin = req.headers.get("origin");
  const host = getRequestHost(req);

  if (!origin) {
    return false;
  }

  // Allow if origin matches the server's host header
  if (host) {
    try {
      if (new URL(origin).host === host) return true;
    } catch {
      // fall through to trusted origins check
    }
  }

  // Allow if origin is in the explicit trusted set (handles Vercel proxy layer)
  return TRUSTED_ORIGINS.has(origin);
}

export function csrfErrorResponse() {
  return NextResponse.json(
    { error: "CSRF validation failed" },
    { status: 403 },
  );
}

export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function applyRateLimit(options: {
  req: NextRequest;
  prefix: string;
  identifier?: string;
  limit: number;
  windowSeconds: number;
}) {
  const id = options.identifier ?? getClientIp(options.req);
  const key = `rl:${options.prefix}:${id}`;
  const result = await rateLimit(key, options.limit, options.windowSeconds);

  if (!result.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": String(result.remaining),
        },
      },
    );
  }

  return null;
}
