import { createFileRoute, Link } from "@tanstack/react-router";
import { WebNav } from "@/components/boujee/WebNav";
import { WebFooter } from "@/components/boujee/WebFooter";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/professionals")({
  head: () => ({ meta: [{ title: "For Professionals — Boujee Book™" }, { name: "description", content: "Grow your book. Get paid faster." }] }),
  component: Pros,
});

function Pros() {
  return (
    <main className="bg-background text-ink">
      <WebNav dark />
      <section className="relative bg-ink text-white pt-40 pb-32 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1920&q=80" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-[11px] tracking-[0.4em] text-gold uppercase mb-6">For Professionals</div>
          <h1 className="font-display text-5xl lg:text-8xl max-w-3xl leading-[0.95]">Own your craft. <em className="text-gold not-italic">Own your book.</em></h1>
          <p className="mt-8 max-w-xl text-white/70 text-lg">The modern operating system for licensed personal care pros. Bookings, payments, CRM, payouts — one app.</p>
          <Link to="/pro" className="mt-10 inline-flex items-center gap-2 px-6 py-4 rounded-full bg-gold text-ink font-medium">Open Pro App <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-3 gap-6">
          {[
            {k:"Instant payouts",v:"Cash hits your card in minutes, not days."},
            {k:"Smart calendar",v:"AI gap-filling, buffer time, no-show protection."},
            {k:"Client CRM",v:"Notes, formulas, before/after — every visit."},
            {k:"Portfolio site",v:"Auto-published booking page, your domain."},
            {k:"Marketing tools",v:"Boost slow days. Win back lapsed clients."},
            {k:"Tax-ready 1099s",v:"Year-end exports done for you."},
          ].map(f=>(
            <div key={f.k} className="rounded-3xl border border-border p-8">
              <div className="font-display text-2xl">{f.k}</div>
              <p className="mt-3 text-sm text-muted-foreground">{f.v}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="py-24 bg-ink text-white text-center">
        <div className="font-display text-5xl lg:text-7xl">$49/mo. Cancel anytime.</div>
        <Link to="/pro" className="mt-10 inline-flex items-center gap-2 px-7 py-4 rounded-full bg-gold text-ink font-medium">Apply Now</Link>
      </section>
      <WebFooter />
    </main>
  );
}
