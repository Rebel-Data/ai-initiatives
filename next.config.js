/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Served under rgmp.net/ai-initiatives via the shared LB URL map. The LB
  // does NOT rewrite the path prefix, so Next.js has to know about it —
  // matches the pattern used by other rgmp.net apps (brand portal, fare
  // dashboard, etc.). Affects page routing, <Link> href generation, and
  // the middleware matcher.
  basePath: "/ai-initiatives",
  // Disables the /_next/image optimizer. Nothing here renders <Image>, but
  // `next start` serves the endpoint regardless and the middleware matcher
  // exempts _next/image — so it is reachable with no session at all. Since
  // Next 15 the optimizer runs sharp, which pulls in libvips. Turning it off
  // keeps that pre-auth surface closed. Remove only alongside a matcher
  // change that puts _next/image behind the session gate.
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_COMMIT_HASH: process.env.NEXT_PUBLIC_COMMIT_HASH || "dev",
  },
};

module.exports = nextConfig;
