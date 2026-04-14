import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/redis";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function getRequestHost(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-host") ?? req.headers.get("host");
}

export function validateSameOrigin(req: NextRequest): boolean {
  if (SAFE_METHODS.has(req.method.toUpperCase())) {
    return true;
  }

  const origin = req.headers.get("origin");
  const host = getRequestHost(req);

  if (!origin || !host) {
    return false;
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
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
  return req.ip ?? "unknown";
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
