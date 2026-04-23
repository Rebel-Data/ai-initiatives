import { NextResponse } from "next/server";

/**
 * Unauthenticated liveness probe. Used by Cloud Run / the load
 * balancer; bypasses middleware via the matcher in src/middleware.ts.
 */
export function GET() {
  return NextResponse.json({ status: "ok" });
}
