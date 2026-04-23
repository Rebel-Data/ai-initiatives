import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Lightweight cookie-presence gate: if no RGMP session cookie is
 * present for a protected route, redirect to rgmp.net/login.
 *
 * Full cryptographic verification happens server-side in page and
 * route handlers via lib/auth#verifySession. Middleware runs on every
 * request, so we keep it fast and skip the verify round-trip here.
 */

const RGMP_URL = process.env.RGMP_AUTH_URL || process.env.RGMP_URL || "https://rgmp.net";
const SESSION_COOKIE_PROD = "__Secure-next-auth.session-token";
const SESSION_COOKIE_DEV = "next-auth.session-token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth-less paths
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/health") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Allow local dev to bypass auth entirely
  if (process.env.SKIP_AUTH === "true") {
    return NextResponse.next();
  }

  const hasCookie =
    request.cookies.has(SESSION_COOKIE_PROD) ||
    request.cookies.has(SESSION_COOKIE_DEV);

  if (hasCookie) {
    return NextResponse.next();
  }

  // API routes: return 401 rather than redirect so clients can handle it.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // UI routes: redirect to RGMP login with a return URL.
  const callback = encodeURIComponent(
    `${RGMP_URL.replace(/\/$/, "")}/ai-initiatives${pathname === "/" ? "" : pathname}`
  );
  return NextResponse.redirect(`${RGMP_URL.replace(/\/$/, "")}/login?callbackUrl=${callback}`);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
