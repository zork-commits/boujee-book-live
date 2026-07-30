import { createFileRoute, Link } from "@tanstack/react-router";
import { WebNav } from "@/components/boujee/WebNav";
import { WebFooter } from "@/components/boujee/WebFooter";
import { CategoryIcon } from "@/components/boujee/CategoryIcon";
import { CATEGORIES } from "@/lib/mock";
import {
  ArrowRight, Star, Shield, MapPin, Clock, ChevronRight, BadgeCheck,
  MessageCircle, CalendarCheck, Navigation, Bell, Lock, FileDown, Scale,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Boujee Book™ — The Operating System for Personal Care" },
      { name: "description", content: "Book licensed beauty and wellness professionals, watch them arrive in real time, and pay with zero commission. Barbers, hair, nails, makeup, lashes, skin, massage, brows." },
      { property: "og:title", content: "Boujee Book™ — Track Them. Book Them. Love Them." },
      { property: "og:description", content: "The operating system for personal care. Live tracking, verified pros, zero commission." },
      { property: "og:image", content: "/screenshots/tracking.png" },
    ],
  }),
  component: Landing,
});

/** Real app screenshot in an iPhone-style frame. */
function Phone({ src, alt, className = "", priority = false }: { src: string; alt: string; className?: string; priority?: boolean }) {
  return (
    <div className={`rounded-[2.6rem] border-[8px] border-ink bg-ink shadow-luxury overflow-hidden ${className}`}>
      <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} className="w-full h-auto block" />
    </div>
  );
}

const FEATURES = [
  { icon: BadgeCheck, title: "Verified professionals", body: "Every pro submits a state license. The gold badge only appears after our trust team reviews it." },
  { icon: Navigation, title: "Live tracking, both ways", body: "Watch your pro drive to you — with real ETA — while they see exactly where you are. Location is shared only during the booking and deleted after." },
  { icon: CalendarCheck, title: "Real availability", body: "You only see times a pro can actually take. Double-booking is impossible — the calendar enforces it." },
  { icon: MessageCircle, title: "Private messaging", body: "Chat without sharing your number. Report and block controls are built into every conversation." },
  { icon: Bell, title: "Every update, instantly", body: "Confirmed, on the way, arrived — you're notified at each step, in the app the second it happens." },
  { icon: Scale, title: "Dispute protection", body: "Something off? Open a dispute from the app; a human reviews it and you get an answer with a resolution on record." },
];

const SHOWCASE = [
  { src: "/screenshots/tracking.png", alt: "Live tracking screen with map, ETA and journey timeline", label: "Live tracking with real ETA" },
  { src: "/screenshots/home.png", alt: "Home screen with categories and upcoming bookings", label: "Everything one thumb away" },
  { src: "/screenshots/search.png", alt: "Search screen with verified professionals", label: "Search licensed pros" },
  { src: "/screenshots/booking.png", alt: "Booking flow service selection", label: "Book in five taps" },
  { src: "/screenshots/pro-profile.png", alt: "Professional profile with portfolio and services", label: "Portfolios & real reviews" },
  { src: "/screenshots/messages.png", alt: "Private messaging with a professional", label: "Message without your number" },
];

function Landing() {
  return (
    <main className="bg-background text-ink">
      <WebNav dark />

      {/* HERO — real product, real screenshot */}
      <section className="relative bg-ink text-white overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&auto=format&fit=crop&q=80" alt="" className="h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/60 to-ink" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-36 pb-20 lg:pt-48 lg:pb-28 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="text-[11px] tracking-[0.4em] text-gold uppercase mb-6">Track Them · Book Them · Love Them™</div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.98]">The Operating System<br />for <em className="text-gold not-italic">Personal Care.</em></h1>
            <p className="mt-7 max-w-xl text-white/70 text-lg">Book licensed beauty and wellness professionals, watch them arrive in real time, and never play phone tag again.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/app" className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-gold text-ink font-medium">Book Now <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/professionals" className="inline-flex items-center gap-2 px-6 py-4 rounded-full border border-white/30">Become a Professional</Link>
            </div>
            <div className="mt-14 grid grid-cols-3 gap-6 max-w-xl">
              {[
                { v: "0%", l: "Commission for pros" },
                { v: "Live", l: "GPS tracking" },
                { v: "8", l: "Crafts, one app" },
              ].map(({ v, l }) => (
                <div key={l}>
                  <div className="font-display text-3xl lg:text-4xl text-gold">{v}</div>
                  <div className="text-xs uppercase tracking-widest text-white/50 mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[320px]">
            <div className="absolute -inset-8 rounded-full bg-gold/15 blur-3xl" aria-hidden />
            <Phone src="/screenshots/tracking.png" alt="Boujee Book live tracking screen showing a professional en route with ETA" priority className="relative" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-14 max-w-2xl">
            <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">01 / Why Boujee Book</div>
            <h2 className="font-display text-4xl lg:text-6xl">Built like the apps you already trust.</h2>
            <p className="mt-4 text-muted-foreground">The polish of a ride-share, the safety of a background-checked marketplace — for your barber, stylist, nail tech, and masseuse.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-3xl bg-cream border border-border p-7 hover:shadow-luxury transition-all">
                <div className="h-11 w-11 rounded-2xl bg-gold/15 grid place-items-center"><Icon className="h-5 w-5 text-ink" /></div>
                <div className="font-display text-2xl mt-5">{title}</div>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APP SHOWCASE — real screenshots */}
      <section className="py-24 lg:py-32 bg-ink text-white overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="text-xs tracking-[0.3em] uppercase text-gold mb-3">02 / The App</div>
              <h2 className="font-display text-4xl lg:text-6xl max-w-2xl">This is the actual app.</h2>
              <p className="mt-4 text-white/60 max-w-xl">No mockups — live screenshots from the product you'll download.</p>
            </div>
          </div>
        </div>
        <div className="flex gap-6 overflow-x-auto no-scrollbar px-6 lg:px-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))] pb-4">
          {SHOWCASE.map((s) => (
            <figure key={s.src} className="shrink-0 w-[240px] lg:w-[270px]">
              <Phone src={s.src} alt={s.alt} />
              <figcaption className="mt-4 text-sm text-white/70 text-center">{s.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">03 / Services</div>
              <h2 className="font-display text-4xl lg:text-6xl max-w-xl">Every craft. One platform.</h2>
            </div>
            <Link to="/services" className="hidden md:inline-flex items-center gap-1 text-sm">All services <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORIES.map(c => (
              <Link key={c.key} to="/app/search" search={{ cat: c.key }} className="aspect-square rounded-3xl bg-cream border border-border p-6 flex flex-col justify-between hover:shadow-luxury transition-all">
                <CategoryIcon category={c.key} className="h-9 w-9 text-gold" strokeWidth={1.5} />
                <div>
                  <div className="font-display text-2xl">{c.label}</div>
                  <div className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">Book now <ChevronRight className="h-3 w-3" /></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FOR PROS */}
      <section className="py-24 lg:py-32 bg-cream">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 flex gap-5 justify-center">
            <Phone src="/screenshots/pro-dashboard.png" alt="Professional dashboard with today's earnings and schedule" className="w-[220px] lg:w-[250px] -rotate-2" />
            <Phone src="/screenshots/pro-earnings.png" alt="Professional earnings screen with revenue breakdown" className="w-[220px] lg:w-[250px] rotate-2 translate-y-8" />
          </div>
          <div className="order-1 lg:order-2">
            <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">04 / For Professionals</div>
            <h2 className="font-display text-4xl lg:text-6xl">Your book, your prices, <em className="text-gold not-italic">your money.</em></h2>
            <p className="mt-6 text-muted-foreground max-w-md">Set up your studio in minutes: your services, your working hours, your rates. Keep 100% of what you earn — Boujee Book runs on memberships, not commissions.</p>
            <ul className="mt-8 space-y-3 max-w-md">
              {[
                "Self-serve onboarding — live and bookable the same day",
                "Availability that protects you: no double-bookings, ever",
                "A real CRM: every client's history, visits, and lifetime value",
                "One-tap journey updates — on my way, arrived, done",
                "Earnings dashboard and CSV statements for tax time",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm"><Star className="h-4 w-4 mt-0.5 text-gold shrink-0" />{f}</li>
              ))}
            </ul>
            <Link to="/pro/onboarding" className="mt-10 inline-flex items-center gap-2 px-6 py-4 rounded-full bg-ink text-white font-medium">Open your studio <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-12 max-w-2xl">
            <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">05 / Trust</div>
            <h2 className="font-display text-4xl lg:text-6xl">Safety isn't a feature. It's the foundation.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Shield, t: "License verification", d: "Pros are reviewed by our trust team before the verified badge appears." },
              { icon: Lock, t: "Private by design", d: "Location shared only during active bookings — then deleted. No ad trackers, ever." },
              { icon: FileDown, t: "Your data, yours", d: "Export everything we hold about you or delete your account — in one tap, no emails." },
              { icon: Clock, t: "24h cancellation", d: "Clear, fair cancellation windows for both sides, enforced by the platform." },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="rounded-3xl border border-border p-6">
                <Icon className="h-5 w-5 text-gold" />
                <div className="font-medium mt-4">{t}</div>
                <p className="text-sm text-muted-foreground mt-2">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 text-center bg-ink text-white">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-[11px] tracking-[0.4em] text-gold uppercase mb-6">Launching soon</div>
          <h2 className="font-display text-5xl lg:text-7xl">Your next look<br />is one tap away.</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/app" className="px-7 py-4 rounded-full bg-gold text-ink font-medium inline-flex items-center gap-2"><MapPin className="h-4 w-4" />Book Now</Link>
            <Link to="/pricing" className="px-7 py-4 rounded-full border border-white/30">See Pricing</Link>
          </div>
        </div>
      </section>

      <WebFooter />
    </main>
  );
}
