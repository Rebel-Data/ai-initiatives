/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Served under rgmp.net/ai-initiatives via the shared LB URL map. The LB
  // does NOT rewrite the path prefix, so Next.js has to know about it —
  // matches the pattern used by other rgmp.net apps (brand portal, fare
  // dashboard, etc.). Affects page routing, <Link> href generation, and
  // the middleware matcher.
  basePath: "/ai-initiatives",
  env: {
    NEXT_PUBLIC_COMMIT_HASH: process.env.NEXT_PUBLIC_COMMIT_HASH || "dev",
  },
};

module.exports = nextConfig;
