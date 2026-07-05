import { createFileRoute, Link } from "@tanstack/react-router";
import { WebNav } from "@/components/groom/WebNav";
import { WebFooter } from "@/components/groom/WebFooter";
import { Check, Crown } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [
    { title: "Pricing — GROOM™" },
    { name: "description", content: "Subscription-only. No commissions, ever. Two plans for customers, two for pros." },
  ] }),
  component: Pricing,
});

const CUSTOMER = [
  { name: "Basic", price: 9.99, desc: "Everything you need to book.", perks: ["Unlimited booking", "Reviews & favorites", "Reminders & history", "Standard support"] },
  { name: "Elite", price: 29.99, desc: "Priority access & protection.", featured: true, perks: ["Priority booking window", "Live ETA tracking", "Cancellation protection", "Full appointment history", "Premium concierge support", "5% rewards back"] },
];

const PRO = [
  { name: "Basic", price: 9.99, desc: "Run your book.", perks: ["Calendar & bookings", "In-app messaging", "Standard payouts (1–2 days)", "Up to 5 bookings / day"] },
  { name: "Elite", price: 29.99, desc: "Grow your studio.", featured: true, perks: ["Up to 10 bookings / day", "Instant payouts", "Featured placement", "Client records & photo notes", "Live tracking", "Premium support"] },
];

function Pricing() {
  return (
    <main className="bg-background text-ink">
      <WebNav dark />
      <section className="bg-ink text-white pt-40 pb-20 text-center px-6">
        <div className="text-[11px] tracking-[0.4em] text-gold uppercase mb-6">Pricing</div>
        <h1 className="font-display text-5xl lg:text-7xl">Subscription only.</h1>
        <p className="mt-4 text-white/60 max-w-xl mx-auto">No commission. No service fees. Pros keep 100% of what they earn — GROOM™ runs on memberships.</p>
      </section>

      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-[11px] tracking-[0.4em] text-muted-foreground uppercase text-center">For Customers</div>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {CUSTOMER.map(t => <PlanCard key={t.name} {...t} ctaTo="/app/subscription" ctaLabel={t.featured ? "Go Elite" : "Start Basic"} />)}
          </div>
        </div>

        <div className="mx-auto max-w-5xl mt-20">
          <div className="text-[11px] tracking-[0.4em] text-muted-foreground uppercase text-center">For Professionals</div>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {PRO.map(t => <PlanCard key={t.name} {...t} ctaTo="/pro/onboarding" ctaLabel={t.featured ? "Apply for Elite" : "Become a Pro"} />)}
          </div>
        </div>

        <div className="mx-auto max-w-3xl mt-20 text-center text-sm text-muted-foreground">
          <p><b>No commission, ever.</b> Pros keep 100% of every service they perform. We make money from memberships — not from your clients.</p>
        </div>
      </section>
      <WebFooter />
    </main>
  );
}

function PlanCard({ name, price, desc, perks, featured, ctaTo, ctaLabel }: {
  name: string; price: number; desc: string; perks: string[]; featured?: boolean;
  ctaTo: "/app/subscription" | "/pro/onboarding"; ctaLabel: string;
}) {
  return (
    <div className={`rounded-3xl border p-8 flex flex-col ${featured ? "bg-ink text-white border-gold shadow-gold-glow" : "border-border bg-background"}`}>
      <div className="flex items-center gap-2">
        {featured && <Crown className="h-4 w-4 text-gold" />}
        <span className="font-display text-2xl">{name}</span>
      </div>
      <div className="mt-6 flex items-baseline gap-1">
        <span className="font-display text-6xl">${price}</span>
        <span className={`text-sm ${featured?"text-white/60":"text-muted-foreground"}`}>/mo</span>
      </div>
      <p className={`mt-2 text-sm ${featured?"text-white/70":"text-muted-foreground"}`}>{desc}</p>
      <ul className="mt-8 space-y-3 flex-1">
        {perks.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className={`h-4 w-4 mt-0.5 shrink-0 ${featured?"text-gold":"text-ink"}`} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link to={ctaTo} className={`mt-8 text-center px-5 py-3 rounded-full font-medium ${featured ? "bg-gold text-ink" : "bg-ink text-white"}`}>{ctaLabel}</Link>
    </div>
  );
}
