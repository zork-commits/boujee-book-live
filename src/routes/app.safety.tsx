import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/boujee/AppShell";
import { AppTabs } from "@/components/boujee/AppTabs";
import { ShieldCheck, BadgeCheck, Sparkles, Flag, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/app/safety")({
  head: () => ({ meta: [{ title: "Trust & Safety — Boujee Book" }] }),
  component: Safety,
});

const PILLARS = [
  { icon: BadgeCheck, t: "Verified pros only", d: "Every professional submits a state cosmetology license and government ID before they can accept bookings." },
  { icon: ShieldCheck, t: "Background checks", d: "Background screening is required for in-home and mobile services." },
  { icon: Sparkles, t: "Sanitation standard", d: "Pros must use new, sealed, or hospital-grade disinfected tools. Reused or unsanitized supplies are not permitted." },
];

function Safety() {
  return (
    <AppShell>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link to="/app/me"><ChevronLeft className="h-5 w-5" /></Link>
        <h1 className="font-display text-2xl">Trust & Safety</h1>
      </header>
      <div className="px-5 mt-2 space-y-3">
        {PILLARS.map(p => {
          const I = p.icon;
          return (
            <div key={p.t} className="rounded-2xl border border-border p-4 flex gap-3">
              <div className="h-10 w-10 rounded-xl bg-gold/15 text-ink grid place-items-center shrink-0"><I className="h-5 w-5" /></div>
              <div className="min-w-0">
                <div className="font-medium text-sm">{p.t}</div>
                <div className="text-xs text-muted-foreground mt-1">{p.d}</div>
              </div>
            </div>
          );
        })}
      </div>

      <section className="px-5 mt-6">
        <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground">Cancellation policy</h2>
        <div className="mt-2 rounded-2xl bg-cream p-4 text-sm">
          Cancel free up to <b>24 hours</b> before your appointment. Late cancellations are charged a <b>$10 fee</b>. Pros who no-show are removed from the platform.
        </div>
      </section>

      <section className="px-5 mt-6 space-y-2">
        <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground">Get help</h2>
        <Link to="/app/dispute" className="flex items-center justify-between rounded-2xl border border-border p-4">
          <span className="flex items-center gap-3"><AlertTriangle className="h-4 w-4" /><span className="text-sm">Open a dispute</span></span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link to="/app/dispute" className="flex items-center justify-between rounded-2xl border border-border p-4">
          <span className="flex items-center gap-3"><Flag className="h-4 w-4" /><span className="text-sm">Report a problem</span></span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </section>

      <AppTabs />
    </AppShell>
  );
}
