# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # Start Next.js dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm test             # Jest tests

npm run supabase:migrate  # Push Supabase SQL migrations
npm run supabase:seed     # Reset local Supabase DB and apply seed.sql
```

TypeScript check (no emit): `npx tsc --noEmit`

## Architecture

This is a Next.js app-router frontend that talks directly to Supabase from client code for auth and application data. There is no Prisma layer and no general-purpose backend API.

### Path Alias

`@/` maps to the repo root.

### Supabase

- Client SDK setup: `lib/supabase/client.ts`
- Server SDK setup for payment-only route handlers: `lib/supabase/server.ts`
- Frontend data operations and DTO mapping: `lib/supabase/data.ts`
- SQL migrations: `supabase/migrations/`
- Seed data: `supabase/seed.sql`

The database schema uses Supabase Auth (`auth.users`) as the identity source. Public app tables live in `public.*`, with RLS policies in the migration file.

### Route Handlers

Only Razorpay payment routes remain under `app/api/payments/*` because Razorpay order creation, signature verification, and webhook verification require server-side secrets:

- `/api/payments/create-order`
- `/api/payments/verify`
- `/api/payments/webhook`

All tournament, profile, feed, contact, and admin reads/writes use the Supabase SDK directly through `lib/supabase/data.ts`.

### Frontend

- State: Zustand auth store at `lib/store/authStore.ts`
- Server state: TanStack React Query
- Auth: Supabase Auth via `AuthInitializer`, `LoginForm`, and `RegisterForm`
- Forms: react-hook-form + Zod resolvers
- File uploads: Supabase Storage buckets `avatars` and `post-images`

### Environment Variables

| Variable | Used by |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase browser and payment route clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase browser and payment route clients |
| `SUPABASE_SERVICE_ROLE_KEY` | Razorpay payment route handlers only |
| `RAZORPAY_KEY_ID` | Razorpay server SDK |
| `RAZORPAY_KEY_SECRET` | Razorpay server SDK |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook verification |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay checkout |
