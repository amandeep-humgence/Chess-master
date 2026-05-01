# ChessMaster

Next.js chess tournament app using Supabase for auth, database, storage, and direct client-side data access.

## Commands

```bash
npm run dev
npm run build
npm test
npm run lint
```

## Supabase

SQL migrations live in `supabase/migrations/`.
Seed data lives in `supabase/seed.sql`.

Set these environment variables before running against a real Supabase project:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Razorpay order creation and verification remain in `app/api/payments/*` because those routes require server-side secrets.
