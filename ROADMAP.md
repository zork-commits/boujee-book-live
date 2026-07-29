# Boujee Book — Production Roadmap

Audit date: 2026-07-29. This is the single source of truth for what's done, what's left,
and the order to build it. P0 = launch blockers. P1 = launch week. P2 = post-launch.

---

## 1. Where we are (verified working today)

| Area | Status |
|---|---|
| **Customer app** | Auth, search + filters/sort, pro profiles, 5-step booking, cancel/rebook, 1-tap reviews (updates pro rating), messaging (5s polling), favorites, tracking screen (real booking, simulated GPS), dispute form (UI only), AI concierge (canned), subscription flow (demo pay) |
| **Pro app** | Self-serve onboarding → live profile, today dashboard + confirm bookings, day-by-day schedule, clients CRM (visits/LTV), earnings + CSV export, studio editing (bio, services CRUD, toggles), payout page (real balance, no rails) |
| **Admin** | Role-gated, live KPIs (GMV/bookings/users/pros), provider approve/reject queue (flips verified badge / reverts account), mobile tab nav, sign out. Users/bookings/payments/disputes tabs = labelled demo data |
| **Platform** | SQLite (libsql) + Drizzle, auto-migrate + gated demo seed (`SEED_DEMO`), scrypt passwords, httpOnly SameSite=Lax cookie sessions (30d), ownership checks on every server fn, server-side price derivation, zero dead buttons, tsc + prod build green |

---

## 2. Product gaps — by role

### Customer (P0 unless noted)
- [ ] **Real payments** — Stripe PaymentIntents on booking confirm; card on file; refunds on cancel. *(needs: Stripe account + keys)*
- [ ] **Password reset** — token flow + email. Without it, one forgotten password = lost account.
- [ ] **Email verification** on signup.
- [ ] **Notifications** — booking confirmed/reminder/message received: in-app feed (P0), email (P0), push (with mobile app, P1).
- [ ] **Account deletion + data export** — required by Apple 5.1.1(v) and GDPR/CCPA anyway.
- [ ] Address entry for mobile bookings (field exists in DB, no UI) (P1).
- [ ] Real availability calendar — pros' working hours + conflict detection so double-booking is impossible (P1; today any slot can be picked).
- [ ] Saved payment methods / Apple Pay (P1, comes with Stripe).
- [ ] Real GPS tracking (P2 — needs native app + pro location sharing).
- [ ] Real AI concierge (P2 — wire to Claude API; current one is canned).

### Pro / vendor (P0 unless noted)
- [ ] **Stripe Connect Express onboarding** — KYC/AML handled by Stripe; required before any payout. *(needs: Stripe)*
- [ ] **Payouts** — release funds after service completion (escrow → transfer), instant payout option.
- [ ] **Media uploads** — license/ID photos (onboarding), avatar/cover/portfolio (studio). *(needs: R2/S3 bucket)*
- [ ] Working hours / availability editor (P1 — pairs with customer availability calendar).
- [ ] Booking accept/decline with expiry (P1 — today pending bookings never expire).
- [ ] Client notes (CRM notes field — schema addition) (P2).
- [ ] Promo tools: featured placement, discount codes (P2).

### Admin (P0 unless noted)
- [ ] **Dispute persistence** — disputes table; customer form writes to it; admin queue reads it; resolution actions (refund needs Stripe).
- [ ] **Users tab real** — list/search real users, suspend/unsuspend (needs `users.status` column).
- [ ] **Bookings tab real** — all bookings, filter by status/date, force-cancel with refund.
- [ ] Payments tab real (P1 — reads from Stripe events once wired).
- [ ] Content moderation queue — reported reviews/messages/photos (P1; required for App Store UGC rules, see §4).
- [ ] Audit log — every admin action recorded (who/what/when) (P1).
- [ ] Admin 2FA (P1) and separate admin session lifetime (shorter).

---

## 3. Security hardening

### Have today
Scrypt password hashing · httpOnly SameSite=Lax secure cookies · server-side session store ·
role checks + resource-ownership checks in every server fn · Zod validation on all inputs ·
prices/durations derived server-side · Drizzle parameterized queries (no SQL injection) ·
React auto-escaping (XSS) · client blocked from importing server code at build time.

### P0 (before real users / real money)
- [ ] **Rate limiting** — login/signup/reset (per-IP + per-account, exponential backoff); booking + message spam caps.
- [ ] **Security headers** — CSP, HSTS, X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- [ ] **Session hardening** — rotate session id on login; "sign out everywhere"; purge expired sessions; cap sessions per user.
- [ ] **Password reset tokens** — single-use, 15-min expiry, hashed at rest (part of reset flow above).
- [ ] **Remove demo-credentials hint** from /auth in production builds.
- [ ] **Secrets hygiene** — all keys via env/secret store; `.env` gitignored (done); no keys in client bundle (enforced by import protection).
- [ ] **Error hygiene** — never leak stack traces/SQL to clients in prod (wrapper exists; verify).

### P1
- [ ] CSRF double-submit token on state-changing server fns (SameSite=Lax already blocks most; belt-and-suspenders before payments).
- [ ] Admin 2FA (TOTP) + audit log (see admin section).
- [ ] Dependency scanning (`npm audit` in CI, Dependabot/Renovate).
- [ ] Backups — nightly DB snapshot + tested restore (Turso has PITR; verify).
- [ ] Uploaded-file safety — type/size validation, image re-encoding, signed URLs, never serve user bytes from app origin.
- [ ] Message/report abuse controls — block user, report content (also an App Store requirement).

### P2
- [ ] Pen test / bug bounty before scale · encrypt PII columns at rest · anomaly alerts on auth + payouts · WAF/bot protection.

---

## 4. Compliance & legal

### Payments & money (with Stripe — P0)
- **PCI-DSS**: use Stripe Elements/Checkout only — card data never touches our servers → SAQ-A scope.
- **KYC/AML for pros**: Stripe Connect Express handles identity + sanctions screening.
- **1099-K / 1099-NEC**: Stripe Tax reporting for pros over IRS thresholds.
- **Marketplace facilitator sales tax**: most US states put collection duty on the platform for taxable services — needs Stripe Tax + state-by-state review (services taxability varies).
- **Refund/cancellation policy**: 24h policy already in ToS page — must match what the code actually does once refunds exist.

### Privacy (P0)
- **Privacy Policy + Terms**: current pages are marketing copy — replace with real counsel-reviewed docs before launch. Must name processors (Stripe, Persona, hosting, email), data categories, retention.
- **GDPR/UK (if EU users) + CCPA/CPRA (California)**: data export, deletion, "do not sell/share" link, consent for marketing. Build the export/delete endpoints once (also satisfies Apple).
- **COPPA**: 13+ age gate at signup (18+ recommended since payments + in-home services).
- **Cookie consent**: only strictly-necessary cookies today (session) → no banner needed; add CMP only if analytics/ads cookies are added.
- **BIPA (Illinois) & biometric laws**: ID-verification selfies via Persona = biometric data — written consent + retention schedule required in that flow.
- **Data breach notification**: have an incident-response contact + plan (all 50 states have notice laws).

### Communications (P1)
- **TCPA**: SMS reminders require express consent checkbox + STOP handling (use Twilio's compliance tooling).
- **CAN-SPAM**: transactional email fine; marketing email needs unsubscribe.

### Marketplace / labor (P1)
- **Independent-contractor classification**: pros set own prices/schedules (good); avoid controlling behavior in ToS (rate mandates, exclusivity). Watch CA AB5 dynamics.
- **State cosmetology law**: many states restrict where licensed services may be performed (salon vs. home visits vary by state) — the mobile-services toggle may need state-level gating.
- **Insurance**: platform general liability + recommending/requiring pro liability insurance for in-home services.
- **Background checks (FCRA)**: consent + adverse-action process if we act on results (Checkr/Persona handle the workflow).

### Accessibility (P1)
- **ADA/WCAG 2.1 AA**: mostly-good semantics; needs pass for focus states, contrast on gold/white, aria labels on icon buttons (many added), reduced-motion.

---

## 5. App Store path (mobile)

Today Boujee Book is a responsive web app (the "phone frame" is cosmetic). Apple does not accept
bare website wrappers (guideline 4.2 minimum functionality). The pragmatic path:

1. **P1 — Capacitor shell** around the existing app + native push notifications, native share,
   haptics, and deep links. This is the fastest store-viable route and reuses 100% of this codebase.
   (Alternative: full Expo/React Native port like rush-mobile — better feel, ~10× the work. Decide after web launch traction.)
2. **Store requirements checklist** (blockers Apple *will* check):
   - [ ] Account deletion inside the app (5.1.1(v)) — build once, shared with web.
   - [ ] UGC rules (1.2): report content, block users, moderation queue + 24h takedown response.
   - [ ] Privacy nutrition labels + App Privacy report (declare Stripe/Persona SDKs' data use).
   - [ ] Payments: booking beauty services = physical-world services → **Stripe is allowed**, no IAP required (3.1.3(e)). Subscriptions for *app features* (Elite membership) sold in-app on iOS may need IAP — safest: sell Elite on web, honor it in app (reader-style), or use IAP for it. Decide with counsel.
   - [ ] Sign in with Apple: only required if we add third-party logins (Google/Facebook). Email/password only → not required.
   - [ ] Demo account for App Review + review notes.
   - [ ] Age rating questionnaire, support URL, marketing URL.
   - [ ] App Tracking Transparency: skip ad tracking at launch → "no tracking" label.
3. **Assets**: app icon, splash, screenshots (6.7"/6.1"/iPad if universal), preview video optional.
4. **Google Play** mirror: data-safety form, content rating, similar UGC rules.

---

## 6. Ops & infrastructure (P0/P1)

- [ ] **Production DB**: Turso (libsql) — swap `DATABASE_URL`, verify auto-migrate, disable demo seed (P0).
- [ ] **Hosting/deploy**: droplet via OpenClaw (nitro node build) or Cloudflare (default target). Custom domain + TLS (P0).
- [ ] **Monitoring**: error tracking (Sentry), uptime check, structured logs (P0-lite: Sentry only).
- [ ] **Email provider**: Resend/Postmark for transactional (reset, confirmations) (P0 — reset flow depends on it).
- [ ] **CI**: typecheck + build + npm audit on push (P1).
- [ ] Staging environment + seeded test data (P1).
- [ ] Analytics: privacy-friendly (Plausible) or GA4 + consent (P1).

---

## 7. Recommended build order

**Phase A — no external accounts needed (can build now):**
in-app notifications feed · dispute persistence + admin queue · admin users/bookings tabs real ·
account deletion + data export · rate limiting · security headers · session hardening ·
password-reset token flow (email delivery stubbed until provider) · availability/working-hours model ·
booking expiry · report/block (moderation base) · audit log · accessibility pass · remove demo hints in prod

**Phase B — needs your accounts/keys:**
Stripe (payments, Connect payouts, Tax) · R2/S3 (uploads) · Resend/Postmark (email) ·
Twilio (SMS, optional) · Persona/Checkr (ID + background checks) · Turso (prod DB) · domain

**Phase C — mobile:**
Capacitor shell + push · store assets · App Review checklist above · submit

**Phase D — polish/scale:**
websockets messaging · real AI concierge · promo tools · pen test · staging · analytics
