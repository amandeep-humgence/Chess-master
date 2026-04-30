# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # Start Next.js dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint

npm run db:generate  # Generate Prisma client after schema changes
npm run db:migrate   # Run database migrations (SQLite)
npm run db:studio    # Open Prisma Studio (database GUI)
npm run db:seed      # Seed data (runs from server/prisma/seed.ts)
npm run db:reset     # Reset database + re-run migrations
```

TypeScript check (no emit): `npx tsc --noEmit`

## Architecture

This is a **full-stack Next.js app** — both frontend and API run in the same Next.js process. There is no separate backend server. The `server/` directory contains the old Express code and is **no longer used at runtime**.

### Path alias
`@/` maps to the repo root (e.g. `@/lib/prisma`).

### Database
- SQLite via Prisma ORM
- Schema: `prisma/schema.prisma` (root)
- Live database file: `server/prisma/prisma/dev.db`
- `DATABASE_URL` in `.env.local` uses `file:../server/prisma/prisma/dev.db` — path is relative to `prisma/schema.prisma`, not the repo root
- Prisma client is a singleton in `lib/prisma.ts`

### API layer (`app/api/`)
Next.js Route Handlers. All endpoints mirror the old Express routes:

| Prefix | Auth required | Admin required |
|--------|--------------|----------------|
| `/api/auth/*` | varies | no |
| `/api/users/*` | varies | no |
| `/api/tournaments/*` | varies | admin for write |
| `/api/payments/*` | yes | no |
| `/api/posts/*` | varies | no |
| `/api/admin/*` | yes | yes |
| `/api/contact` | no | no |

**Shared utilities used in every route handler:**
- `lib/auth-server.ts` — `getSession()`, `requireAuth()`, `requireAdmin()` (reads JWT from `cookies()`)
- `lib/api-helpers.ts` — `successResponse()`, `errorResponse()`, `handleError()`
- `lib/db/*.ts` — thin Prisma wrappers (user, tournament, registration, payment, post, contact)
- `lib/validators/*.ts` — Zod schemas for request body validation

**Auth flow:** JWT stored in an `httpOnly` cookie named `token`. On login/register, the route sets the cookie via `await cookies()` from `next/headers`. `requireAuth()` reads and verifies it; throws `'UNAUTHORIZED'` or `'FORBIDDEN'` which `handleError()` maps to 401/403.

**File uploads:** `lib/upload.ts` reads `request.formData()` and writes to `public/uploads/`. Uploaded URLs are served as static files at `/uploads/<filename>`.

**Razorpay payments:** `lib/razorpay.ts` holds the SDK instance and HMAC verification helpers. The webhook route reads the raw body via `request.text()`.

### Frontend (`app/` pages, `components/`, `lib/`)
- **State:** Zustand auth store at `lib/store/authStore.ts`
- **Server state:** TanStack React Query for all data fetching
- **HTTP client:** Axios instance at `lib/api.ts` (no baseURL — uses relative `/api/*` paths)
- **Forms:** react-hook-form + Zod resolvers
- `AuthInitializer` component calls `/api/auth/me` on mount to restore session
- `AuthGuard` / `AdminGuard` components redirect unauthenticated or non-admin users

### Environment variables (`.env.local`)
| Variable | Used by |
|----------|---------|
| `DATABASE_URL` | Prisma (server-side only) |
| `JWT_SECRET` | `lib/auth-server.ts` |
| `JWT_EXPIRES_IN` | `lib/auth-server.ts` |
| `RAZORPAY_KEY_ID` | `lib/razorpay.ts` + frontend |
| `RAZORPAY_KEY_SECRET` | `lib/razorpay.ts` |
| `RAZORPAY_WEBHOOK_SECRET` | `lib/razorpay.ts` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `RazorpayCheckout` component |
