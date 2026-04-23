# AI Initiatives

A place for Rebel to share AI-powered tooling and initiatives they're building
or exploring, and for others to sign up to contribute or get updates.

Served behind the shared Rebel load balancer at
[`rgmp.net/ai-initiatives`](https://rgmp.net/ai-initiatives), sharing SSO with
the rest of the `rgmp.net` ecosystem via `rgmp.net/api/auth/verify` (see
[`docs/AUTH_INTEGRATION.md`](https://github.com/Rebel-Data/rgmp-applications/blob/main/docs/AUTH_INTEGRATION.md)
in `rgmp-applications` for the full SSO integration guide).

## Stack

- Next.js 14 (App Router, standalone output)
- Prisma + PostgreSQL
- Tailwind CSS
- Cloud Run (Docker) in `mobility-payments-db` / `europe-west4`

## Local development

```bash
npm install
cp .env.example .env.local  # fill in DATABASE_URL + INTERNAL_API_KEY
npm run db:migrate          # apply Prisma migrations against local DB
SKIP_AUTH=true npm run dev  # bypass SSO for local iteration
```

Port 3001 by default (to avoid clashing with `rgmp-applications` on 3000).

## Environment variables

| Name | Purpose | Example |
| --- | --- | --- |
| `DATABASE_URL` | Postgres connection string | `postgresql://…` |
| `INTERNAL_API_KEY` | Shared secret for `rgmp.net/api/auth/verify` | from Secret Manager |
| `RGMP_AUTH_URL` | Base URL of the SSO service | `https://rgmp.net` |
| `NEXT_PUBLIC_COMMIT_HASH` | Build version shown in the footer | set by CI |
| `SKIP_AUTH` | Local dev only — bypass SSO | `true` |

## Deployment (first-time bootstrap)

The recipe mirrors the RebelWiki status service (see
[`docs/WIKI_STATUS_INTEGRATION.md`](https://github.com/Rebel-Data/rgmp-applications/blob/main/docs/WIKI_STATUS_INTEGRATION.md)
for the exact gcloud commands and the Cloud Run Service Agent gotcha):

1. Create the Cloud Run service in `mobility-payments-db / europe-west4`
   with the shared `INTERNAL_API_KEY` from Secret Manager mounted as an env var.
2. Create a serverless NEG + backend service.
3. Add a path rule to `rgmp-url-map` routing `/ai-initiatives` and
   `/ai-initiatives/*` to that backend.
4. Add a tile on `rgmp.net` pointing at `/ai-initiatives`.
5. Run `prisma migrate deploy` against the production database once the
   container is up.

## Project layout

```
src/
├── middleware.ts        Cookie-presence gate; redirects to rgmp.net/login
├── lib/
│   ├── auth.ts          verifySession() — calls rgmp.net/api/auth/verify
│   └── prisma.ts        Prisma client singleton
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/health/      Unauthenticated liveness probe
└── styles/globals.css
prisma/
└── schema.prisma        Models added in feature branches
```
