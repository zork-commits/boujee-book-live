import { createFileRoute, Link } from "@tanstack/react-router";
import { WebNav } from "@/components/boujee/WebNav";
import { WebFooter } from "@/components/boujee/WebFooter";
import { CategoryIcon } from "@/components/boujee/CategoryIcon";
import { PROS, CATEGORIES } from "@/lib/mock";
import { ArrowRight, Star, Shield, Sparkles, MapPin, Clock, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Boujee Book™ — The Operating System for Personal Care" },
      { name: "description", content: "Book trusted beauty and wellness professionals in minutes. Barbers, hairstylists, nails, makeup, lashes, esthetics, massage." },
      { property: "og:title", content: "Boujee Book™ — Track Them. Book Them. Love Them." },
      { property: "og:description", content: "The operating system for personal care." },
      { property: "og:image", content: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&auto=format&fit=crop&q=80" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="bg-background text-ink">
      <WebNav dark />
      {/* HERO */}
      <section className="relative min-h-screen bg-ink text-white overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&auto=format&fit=crop&q=80" alt="" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/40 to-ink" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-40 pb-24 lg:pt-56 lg:pb-40">
          <div className="text-[11px] tracking-[0.4em] text-gold uppercase mb-6">Track Them · Book Them · Love Them™</div>
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95] max-w-4xl">The Operating System<br />for <em className="text-gold not-italic">Personal Care.</em></h1>
          <p className="mt-8 max-w-xl text-white/70 text-lg">Book trusted beauty and wellness professionals in minutes.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/app" className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-gold text-ink font-medium">Book Now <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/professionals" className="inline-flex items-center gap-2 px-6 py-4 rounded-full border border-white/30">Become a Professional</Link>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl">
            {[["6,240","Pros"],["142","Cities"],["4.97","Avg rating"]].map(([v,l]) => (
              <div key={l}>
                <div className="font-display text-3xl lg:text-4xl text-gold inline-flex items-center gap-2">
                  {v}
                  {l === "Avg rating" && <Star className="h-6 w-6 fill-gold text-gold" />}
                </div>
                <div className="text-xs uppercase tracking-widest text-white/50 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">01 / Services</div>
              <h2 className="font-display text-4xl lg:text-6xl max-w-xl">Every craft. One platform.</h2>
            </div>
            <Link to="/services" className="hidden md:inline-flex items-center gap-1 text-sm">All services <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORIES.map(c => (
              <div key={c.key} className="aspect-square rounded-3xl bg-cream border border-border p-6 flex flex-col justify-between hover:shadow-luxury transition-all">
                <CategoryIcon category={c.key} className="h-9 w-9 text-gold" strokeWidth={1.5} />
                <div>
                  <div className="font-display text-2xl">{c.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">from $45</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRO SHOWCASE */}
      <section className="py-24 lg:py-32 bg-cream">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">02 / Talent</div>
              <h2 className="font-display text-4xl lg:text-6xl max-w-xl">Elite professionals near you.</h2>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PROS.slice(0,6).map(p => (
              <Link key={p.id} to="/app/p/$id" params={{ id: p.id }} className="group rounded-3xl overflow-hidden bg-background border border-border hover:shadow-luxury transition-all">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img src={p.cover} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  {p.elite && <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-gold text-ink text-[10px] tracking-widest uppercase font-semibold">Elite</div>}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                    <div>
                      <div className="font-display text-2xl">{p.name}</div>
                      <div className="text-xs opacity-80">{p.craft} · {p.city}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs"><Star className="h-3.5 w-3.5 fill-gold text-gold" />{p.rating}</div>
                  </div>
                </div>
                <div className="p-5 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">from <span className="text-foreground font-medium">${p.price}</span></span>
                  <span className="inline-flex items-center gap-1 font-medium">Book <ChevronRight className="h-4 w-4" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* APP PROMO */}
      <section className="py-24 lg:py-32 bg-ink text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-xs tracking-[0.3em] uppercase text-gold mb-4">03 / The App</div>
            <h2 className="font-display text-4xl lg:text-6xl">Built for the way you book.</h2>
            <p className="mt-6 text-white/70 max-w-md">Live tracking. One-tap rebooking. Apple Pay. Memberships. Designed for the next decade of personal care.</p>
            <div className="mt-10 grid grid-cols-2 gap-6 max-w-md">
              {[
                {i:Shield,l:"Licensed pros only"},
                {i:Sparkles,l:"AI style matching"},
                {i:MapPin,l:"Live ETA tracking"},
                {i:Clock,l:"60-second booking"},
              ].map(({i:I,l})=>(
                <div key={l} className="flex items-center gap-3"><I className="h-5 w-5 text-gold" /><span className="text-sm">{l}</span></div>
              ))}
            </div>
            <Link to="/app" className="mt-10 inline-flex items-center gap-2 px-6 py-4 rounded-full bg-gold text-ink font-medium">Open the App <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="relative">
            <div className="mx-auto max-w-[300px] aspect-[9/19] rounded-[3rem] border-[10px] border-white/10 overflow-hidden bg-cream shadow-gold-glow">
              <img src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&auto=format&fit=crop&q=80" alt="" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="font-display text-5xl lg:text-7xl">Your next look<br />is one tap away.</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/app" className="px-7 py-4 rounded-full bg-ink text-white font-medium">Book Now</Link>
            <Link to="/pricing" className="px-7 py-4 rounded-full border border-ink/20">See Pricing</Link>
          </div>
        </div>
      </section>

      <WebFooter />
    </main>
  );
}
