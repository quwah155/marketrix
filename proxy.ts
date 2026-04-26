import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Next.js 16 proxy (replaces middleware.ts).
 *
 * Lightweight edge checks only:
 *   - Cookie-based session presence (no DB calls)
 *   - Role-based redirects using JWT payload
 *   - Security headers
 *
 * Heavy auth validation (DB look-ups, role enforcement) stays in
 * server components / server actions via requireAuth() / requireRole().
 */
export default async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ─── Public routes — always allow through ──────────────────────────────────
  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/stripe/webhook") ||
    pathname.startsWith("/api/uploadthing") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/unauthorized");

  if (isPublic) {
    return addSecurityHeaders(NextResponse.next());
  }

  // ─── Decode the JWT from the session cookie (edge-safe, no DB) ────────────
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ─── Not logged in → redirect to login ───────────────────────────────────
  if (!token) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string | undefined;

  // ─── Admin routes ─────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // ─── Vendor dashboard ─────────────────────────────────────────────────────
  if (
    pathname.startsWith("/dashboard/vendor") &&
    role !== "VENDOR" &&
    role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // ─── Buyer dashboard (any authenticated user) ─────────────────────────────
  // Already covered by the !token check above, so just pass through.

  return addSecurityHeaders(NextResponse.next());
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js)).*)",
  ],
};
