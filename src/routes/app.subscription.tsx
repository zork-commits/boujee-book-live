import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/boujee/AppShell";
import { AppTabs } from "@/components/boujee/AppTabs";
import { Check, Crown, ChevronLeft, CreditCard, Apple } from "lucide-react";

export const Route = createFileRoute("/app/subscription")({
  head: () => ({ meta: [{ title: "Subscription — Boujee Book" }] }),
  component: Subscription,
});

const PLANS = [
  {
    id: "basic", name: "Basic", price: 9.99,
    perks: ["Unlimited booking", "Standard support", "Reviews & favorites", "Email reminders"],
  },
  {
    id: "elite", name: "Elite", price: 29.99, featured: true,
    perks: ["Priority booking window", "Live ETA tracking", "Cancellation protection", "Full appointment history", "Premium concierge support", "5% rewards back"],
  },
];

function Subscription() {
  const [plan, setPlan] = useState("elite");
  const [step, setStep] = useState<"plan"|"pay"|"done">("plan");
  const chosen = PLANS.find(p => p.id === plan)!;

  return (
    <AppShell>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link to="/app/me"><ChevronLeft className="h-5 w-5" /></Link>
        <h1 className="font-display text-2xl">Membership</h1>
      </header>

      {step === "plan" && (
        <div className="px-5 mt-2 space-y-3">
          {PLANS.map(p => (
            <button key={p.id} onClick={() => setPlan(p.id)} className={`w-full text-left rounded-3xl p-5 border transition ${plan===p.id ? "border-gold bg-ink text-white" : "border-border bg-background"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {p.featured && <Crown className="h-4 w-4 text-gold" />}
                  <span className="font-display text-xl">{p.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-display text-3xl">${p.price}</span>
                  <span className={`text-xs ${plan===p.id?"text-white/60":"text-muted-foreground"}`}>/mo</span>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {p.perks.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`h-4 w-4 mt-0.5 ${plan===p.id?"text-gold":"text-ink"}`} />
                    <span className={plan===p.id?"text-white/90":""}>{f}</span>
                  </li>
                ))}
              </ul>
            </button>
          ))}
          <button onClick={() => setStep("pay")} className="w-full mt-4 py-4 rounded-full bg-ink text-white font-medium">
            Continue · ${chosen.price}/mo
          </button>
          <p className="text-[10px] text-center text-muted-foreground px-4">Cancel anytime. 24-hour cancellation policy applies to bookings.</p>
        </div>
      )}

      {step === "pay" && (
        <div className="px-5 mt-2 space-y-4">
          <div className="rounded-2xl bg-cream p-4 flex justify-between items-center">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{chosen.name} plan</div>
              <div className="font-display text-2xl">${chosen.price}<span className="text-xs text-muted-foreground">/mo</span></div>
            </div>
            <button onClick={() => setStep("plan")} className="text-xs underline">Change</button>
          </div>
          <button onClick={() => setStep("done")} className="w-full py-3.5 rounded-2xl bg-ink text-white font-medium flex items-center justify-center gap-2"><Apple className="h-4 w-4" />Pay with Apple Pay</button>
          <div className="rounded-2xl border border-border p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><CreditCard className="h-4 w-4" />Card details</div>
            <input placeholder="1234 5678 9012 3456" className="w-full px-3 py-3 rounded-xl bg-cream text-sm outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="MM / YY" className="px-3 py-3 rounded-xl bg-cream text-sm outline-none" />
              <input placeholder="CVC" className="px-3 py-3 rounded-xl bg-cream text-sm outline-none" />
            </div>
            <input placeholder="ZIP code" className="w-full px-3 py-3 rounded-xl bg-cream text-sm outline-none" />
          </div>
          <button onClick={() => setStep("done")} className="w-full py-4 rounded-full bg-gold text-ink font-medium">Subscribe</button>
          <p className="text-[10px] text-center text-muted-foreground">Powered by Stripe. Your card is encrypted.</p>
        </div>
      )}

      {step === "done" && (
        <div className="px-5 mt-12 text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-gold/20 grid place-items-center"><Crown className="h-10 w-10 text-gold" /></div>
          <h2 className="font-display text-3xl mt-6">Welcome to {chosen.name}.</h2>
          <p className="text-sm text-muted-foreground mt-2">Your benefits are active immediately.</p>
          <Link to="/app" className="inline-block mt-8 px-6 py-3 rounded-full bg-ink text-white text-sm">Back to home</Link>
        </div>
      )}

      <AppTabs />
    </AppShell>
  );
}
