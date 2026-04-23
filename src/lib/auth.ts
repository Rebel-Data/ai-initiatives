/**
 * Server-side session verification against the shared Rebel SSO.
 *
 * Every request under rgmp.net carries a `.rgmp.net` session cookie
 * set by the NextAuth instance in rgmp-applications. This module
 * verifies that cookie by calling rgmp.net/api/auth/verify and
 * returning the authenticated user (or null).
 *
 * See docs/AUTH_INTEGRATION.md in the rgmp-applications repo for the
 * canonical integration guide.
 */

import { cookies, headers } from "next/headers";

const RGMP_URL = process.env.RGMP_AUTH_URL || process.env.RGMP_URL || "https://rgmp.net";
const SESSION_COOKIE_PROD = "__Secure-next-auth.session-token";
const SESSION_COOKIE_DEV = "next-auth.session-token";

export type UserRole = "admin" | "comms" | "viewer";

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: UserRole;
}

interface VerifyResponse {
  authenticated: boolean;
  user?: SessionUser;
  expires?: string;
  error?: string;
}

/**
 * Extract the session token from incoming cookies, preferring the
 * production cookie name with a fallback to the dev name.
 */
function readSessionToken(): string | null {
  const jar = cookies();
  return (
    jar.get(SESSION_COOKIE_PROD)?.value ??
    jar.get(SESSION_COOKIE_DEV)?.value ??
    null
  );
}

/**
 * Call rgmp.net/api/auth/verify with the caller's session cookie.
 * Returns null on any non-authenticated response.
 */
export async function verifySession(): Promise<SessionUser | null> {
  const token = readSessionToken();
  if (!token) return null;

  const cookieName = headers().get("x-forwarded-proto") === "http" && process.env.NODE_ENV !== "production"
    ? SESSION_COOKIE_DEV
    : SESSION_COOKIE_PROD;

  try {
    const res = await fetch(`${RGMP_URL}/api/auth/verify`, {
      method: "GET",
      headers: {
        Cookie: `${cookieName}=${token}`,
        ...(process.env.INTERNAL_API_KEY
          ? { "x-internal-api-key": process.env.INTERNAL_API_KEY }
          : {}),
      },
      // Don't cache auth decisions across requests/users.
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data: VerifyResponse = await res.json();
    if (!data.authenticated || !data.user) return null;

    return data.user;
  } catch (err) {
    console.error("[ai-initiatives] verifySession failed:", err);
    return null;
  }
}

/**
 * Build the RGMP login URL with a callbackUrl pointing back to the
 * caller's current path.
 */
export function loginUrl(callbackPath: string): string {
  const cb = encodeURIComponent(`${RGMP_URL.replace(/\/$/, "")}${callbackPath}`);
  return `${RGMP_URL.replace(/\/$/, "")}/login?callbackUrl=${cb}`;
}
