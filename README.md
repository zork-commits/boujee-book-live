# Boujee Book™

**The Operating System for Personal Care.** Book trusted beauty and wellness professionals — barbers, hair, nails, makeup, lashes, skin, massage — in minutes.

Track Them · Book Them · Love Them™

## What's in the box

| Surface | Route | Status |
|---|---|---|
| Marketing site | `/`, `/services`, `/pricing`, `/about`, … | Static, fully branded |
| Consumer app | `/app/*` | **Live** — auth-gated, backed by SQLite |
| Pro studio | `/pro/*` | **Live** — schedule, earnings, clients CRM |
| Auth | `/auth` | Email/password, httpOnly cookie sessions (30 days) |
| Admin & investor pages | `/admin`, `/investors` | Demo data (wire before exposing) |

### Working end-to-end today
- Sign up / sign in / sign out (scrypt-hashed passwords, DB-backed sessions)
- Search pros by text + category (server-side filtering)
- Pro profiles with real services, reviews, and favorite toggle
- 5-step booking flow → creates a real booking (price/duration resolved server-side, never trusted from the client)
- Bookings list: upcoming/past, cancel, 1-tap star rating (updates the pro's aggregate rating), rebook
- Messaging: threads per customer↔pro, new-thread from a profile, 5s polling
- Live-tracking screen driven by your actual next booking
- Pro dashboard: today's schedule with confirm-pending action, earnings (day/week/month + weekly chart + top services), clients CRM with visits/LTV, day-by-day schedule view
- **Self-serve pro onboarding**: any signed-in user applies at `/pro/onboarding` (craft, city, bio, license info, service menu) → pro profile is created, account upgraded, and they're instantly discoverable in consumer search
- Pro Studio tab: edit bio, add/remove services (starting price auto-syncs), toggle in-shop/mobile

## Stack

- **Framework**: TanStack Start (React 19, file-based routes, server functions as the API layer — no separate REST server needed)
- **DB**: SQLite via `@libsql/client` + Drizzle ORM ([src/db/schema.ts](src/db/schema.ts))
- **Styling**: Tailwind 4 + shadcn/ui, Cormorant Garamond + Inter, gold/ink/cream luxury system

## Run it

```sh
npm install
npm run dev        # http://localhost:8080
```

First boot auto-creates `data/boujee.db`, runs DDL, and seeds demo data (dev only — see `SEED_DEMO` in [.env.example](.env.example)).

**Demo accounts** (password `boujee123`):
- `demo@boujeebook.app` — customer (Maya Reyes)
- `marcus@boujeebook.app` — pro (Marcus Vega, barber) → lands on `/pro`
- `admin@boujeebook.app` — admin

## Architecture notes

- `src/fn/*` — server functions (safe to import from client code; compiled to RPC stubs)
- `src/server/*` — **server-only** (sessions, password hashing). The Vite config blocks client imports of `**/server/**` — keep secrets-adjacent code here.
- `src/db/*` — Drizzle schema, client, auto-migrate + seed (`ensureDb()`)
- `src/lib/api.ts` — react-query hooks wrapping every server function
- Env vars (see [.env.example](.env.example)): `DATABASE_URL` (default `file:./data/boujee.db`; point at Turso/libsql for prod), `DATABASE_AUTH_TOKEN`, `SEED_DEMO`

## Launch checklist (for the deploy agent)

1. **Database**: set `DATABASE_URL` to a Turso (or any libsql) instance for production; the file DB is fine for a single node.
2. **Payments**: the pay step is UI-only. Wire Stripe PaymentIntents in `createBooking` ([src/fn/bookings.ts](src/fn/bookings.ts)) and Stripe Connect for pro payouts (`/pro/payout` shows the real balance but "cash out" is not wired).
3. ~~Seed data~~ Done: demo seed only runs when `SEED_DEMO=1` or in non-production. Leave `SEED_DEMO` unset in prod for a clean DB.
4. ~~Pro onboarding~~ Done: applications create a real pro profile (unverified), and `/admin` → Providers has a live approve/reject queue that flips `pros.verified`. Remaining: file uploads for license/ID photos (needs object storage + Persona).
5. **Admin console**: now auth-gated (admin role only). Overview KPIs and the provider queue are live; users/bookings/payments/disputes tabs are still demo data (labelled) pending payments + dispute persistence. Investor page is public demo numbers.
6. **Realtime**: messages poll every 5s; swap to websockets/SSE when needed.
7. Remove the demo-credentials hint from the auth screen ([src/routes/auth.tsx](src/routes/auth.tsx)) before public launch.
8. **Media uploads**: pro avatar/cover/portfolio use stock defaults — add object storage (S3/R2) for the Camera/Plus buttons in the Studio tab.
