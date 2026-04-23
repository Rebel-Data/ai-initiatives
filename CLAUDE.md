# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # Next.js dev server on port 3001 (not 3000 — avoids clash with rgmp-applications)
SKIP_AUTH=true npm run dev   # bypass SSO locally; required unless you have a real rgmp.net session cookie
npm run build          # runs `prisma generate` then `next build` (standalone output)
npm run start          # serve the built app
npm run lint           # eslint via next lint
npm run typecheck      # tsc --noEmit
npm run db:migrate     # prisma migrate dev (local schema changes)
npm run db:deploy      # prisma migrate deploy (production)
npm run db:studio      # prisma studio GUI
```

No test runner is configured. "Verification" here = `npm run lint && npm run typecheck && npm run build`, plus a manual repro in the dev server.

## Architecture

This is a small Next.js 14 (App Router) app deployed to Cloud Run and served **behind the shared Rebel load balancer at `rgmp.net/ai-initiatives`**. The LB strips the `/ai-initiatives` prefix before the request reaches the container, so Next.js routes are written as if they live at the root. `NEXT_PUBLIC_COMMIT_HASH` is the only env var exposed via `next.config.js`; the `/ai-initiatives` prefix is *not* configured as a Next.js basePath.

### Auth model — two-layer, do not collapse them

Auth is delegated to the shared RGMP SSO (`rgmp.net/api/auth/verify`, documented in `rgmp-applications/docs/AUTH_INTEGRATION.md`). The integration uses two distinct layers, and they must stay distinct:

1. **`src/middleware.ts`** — runs on every request. It only checks for the *presence* of the `.rgmp.net` session cookie (`__Secure-next-auth.session-token` in prod, `next-auth.session-token` in dev). If present, it passes through; if missing, it redirects UI routes to `rgmp.net/login` or returns 401 on `/api/*`. It is intentionally fast and does **not** cryptographically verify the session.
2. **`src/lib/auth.ts#verifySession()`** — called from every page/route handler that needs the user. It forwards the session cookie to `rgmp.net/api/auth/verify` (with `INTERNAL_API_KEY` as `x-internal-api-key`) and returns a typed `SessionUser` or `null`. This is the real auth gate.

When adding a new page or API route, **always call `verifySession()` server-side** — the middleware alone is not sufficient because it does not validate the cookie's signature or expiry. `/api/health` is the only route intentionally unauthenticated (liveness probe, allowlisted in the middleware matcher).

`SKIP_AUTH=true` short-circuits only the middleware; if your code calls `verifySession()` you still need a real cookie or you must branch on `SKIP_AUTH` yourself.

### Data layer

- Prisma + PostgreSQL. Models live in `prisma/schema.prisma` (currently `AiInitiative` and `AiInitiativeMember`).
- `src/lib/prisma.ts` exports a **singleton** `PrismaClient` stashed on `globalThis` in non-production to avoid exhausting connections during HMR. Import from `@/lib/prisma`; do not `new PrismaClient()` anywhere else.
- Status is stored as a free-form string but validated against the tuple `["exploring","building","shipped","archived"]` at the API boundary (see `src/app/api/initiatives/route.ts`). Keep the tuple and Prisma default in sync if you add a status.
- Migrations live under `prisma/migrations/`. Create them with `npm run db:migrate` locally; prod applies them via `npm run db:deploy` after a container rollout (see README deployment notes).

### Route conventions

- `src/app/page.tsx` (list), `src/app/new/` (create form), `src/app/[id]/` (detail) — server components that call `verifySession()` before rendering and fetch through Prisma directly.
- `src/app/api/initiatives/` + `[id]/` + `[id]/members/` — JSON route handlers. Each handler re-verifies the session; never assume middleware has authenticated.
- `@/*` path alias maps to `src/*` (see `tsconfig.json`).

### Deploy

- Dockerfile targets `node:22-alpine`, uses Next.js standalone output, runs `prisma generate` during `npm run build` (also in the Dockerfile explicitly).
- Prisma needs the musl binary target — already set via `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` in `schema.prisma`. Do not remove.
- Deployed to Cloud Run in `mobility-payments-db / europe-west4`. `INTERNAL_API_KEY` comes from Secret Manager.

## Gotchas

- The dev server runs on **3001**, not 3000. If you see "port in use," it's likely `rgmp-applications` on 3000 or a stale `next dev` — check before picking another port.
- `npm run build` depends on `prisma generate` succeeding; if you change `schema.prisma`, re-run build or `postinstall` will fall behind.
- When debugging auth locally, `SKIP_AUTH=true` only skips the middleware. Pages that call `verifySession()` will still return no user unless you also stub `verifySession` or hit a real rgmp.net verify endpoint.
- The load balancer strips `/ai-initiatives`. Any hardcoded absolute link you write for inter-app navigation (e.g. back to `rgmp.net/...`) must include the prefix; internal `<Link href="/...">` must not.
