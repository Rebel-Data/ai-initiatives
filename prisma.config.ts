import { defineConfig } from "prisma/config";

// Prisma 7 no longer auto-loads env files. Local dev uses .env.local;
// CI and Docker have no env file and pass DATABASE_URL directly.
try {
  process.loadEnvFile(".env.local");
} catch {}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Plain process.env (not env()) so `prisma generate` works without a URL
  // (postinstall in CI and the Docker deps stage). Migrate commands still
  // fail loudly if it is unset.
  datasource: { url: process.env.DATABASE_URL ?? "" },
});
