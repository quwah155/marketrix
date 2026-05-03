import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { applySecurityHeaders } from "@/lib/security-headers";

const PUBLIC_PREFIXES = [
  "/products",
  "/auth",
  "/api/auth",
  "/api/stripe/webhook",
  "/api/uploadthing",
  "/_next",
  "/favicon",
  "/unauthorized",
] as const;

function isPublicRoute(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

function getSafeCallbackUrl(req: NextRequest): string {
  const { pathname, search } = req.nextUrl;
  return `${pathname}${search}`;
}

function unauthorizedApiResponse(): NextResponse {
  return applySecurityHeaders(
    NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  );
}

function forbiddenApiResponse(): NextResponse {
  return applySecurityHeaders(
    NextResponse.json({ error: "Forbidden" }, { status: 403 })
  );
}

function redirectToLogin(req: NextRequest, clearCookies = false): NextResponse {
  const loginUrl = new URL("/auth/login", req.url);
  loginUrl.searchParams.set("callbackUrl", getSafeCallbackUrl(req));

  const response = applySecurityHeaders(NextResponse.redirect(loginUrl));
  if (clearCookies) {
    response.cookies.delete("next-auth.session-token");
    response.cookies.delete("__Secure-next-auth.session-token");
  }

  return response;
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");

  if (isPublicRoute(pathname)) {
    return applySecurityHeaders(NextResponse.next());
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return isApi ? unauthorizedApiResponse() : redirectToLogin(req);
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  if (token.exp && nowInSeconds > (token.exp as number)) {
    return isApi ? unauthorizedApiResponse() : redirectToLogin(req, true);
  }

  const role = token.role as string | undefined;

  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (isAdminRoute && role !== "ADMIN") {
    return isApi
      ? forbiddenApiResponse()
      : applySecurityHeaders(
          NextResponse.redirect(new URL("/unauthorized", req.url))
        );
  }

  const isVendorRoute =
    pathname.startsWith("/dashboard/vendor") ||
    pathname.startsWith("/api/vendor");
  if (isVendorRoute && role !== "VENDOR" && role !== "ADMIN") {
    return isApi
      ? forbiddenApiResponse()
      : applySecurityHeaders(
          NextResponse.redirect(new URL("/unauthorized", req.url))
        );
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|woff2?|ttf|map)).*)",
  ],
};
