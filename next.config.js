/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // The app is served under rgmp.net/ai-initiatives through the shared
  // load balancer's URL map. Next.js doesn't need to know about that
  // prefix for routing (the LB strips the prefix before reaching the
  // container), but we expose it for <Link> back-references when needed.
  env: {
    NEXT_PUBLIC_COMMIT_HASH: process.env.NEXT_PUBLIC_COMMIT_HASH || "dev",
  },
};

module.exports = nextConfig;
