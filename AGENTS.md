# Agent notes — Boujee Book

This repo started as a Lovable export ("Groom") and has been rebranded to **Boujee Book** and wired to a real backend. It is no longer connected to Lovable.

Ground rules:

- **Never import `src/server/**` from client-reachable code.** The Vite config hard-errors on it. Server functions live in `src/fn/*` (importable anywhere — they compile to RPC stubs); server-only helpers (cookies, sessions, password hashing) live in `src/server/*`.
- `src/routeTree.gen.ts` is generated — don't hand-edit.
- DB schema changes go in **both** [src/db/schema.ts](src/db/schema.ts) (Drizzle) and the DDL block in [src/db/index.ts](src/db/index.ts) (runtime auto-migrate). Keep them in sync.
- `data/` is gitignored (local SQLite). Delete `data/boujee.db` to re-seed from scratch.
- Verify with `npx tsc --noEmit` and `npm run build` before committing.
- See README.md → "Launch checklist" for what's intentionally not production-ready yet (payments, prod seeding, admin wiring).
