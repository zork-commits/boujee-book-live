import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/boujee/AppShell";
import { ProTabs } from "@/components/boujee/ProTabs";
import { Check, Upload, ShieldCheck, IdCard, Sparkles, Scissors } from "lucide-react";

export const Route = createFileRoute("/pro/onboarding")({
  head: () => ({ meta: [{ title: "Become a Pro — Boujee Book" }] }),
  component: Onboarding,
});

const STEPS = [
  { k: "profile", t: "Profile", i: Scissors },
  { k: "license", t: "License", i: IdCard },
  { k: "id", t: "ID", i: ShieldCheck },
  { k: "services", t: "Services", i: Sparkles },
];

function Onboarding() {
  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);

  return (
    <AppShell dark>
      <div className="bg-ink text-white min-h-full">
        <header className="px-5 pt-6 pb-4">
          <div className="text-[10px] uppercase tracking-[0.4em] text-gold">Pro onboarding</div>
          <h1 className="font-display text-3xl mt-2">Set up your studio</h1>
        </header>

        <div className="px-5 mt-2 grid grid-cols-4 gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s.k} className={`h-1 rounded-full ${i<=step?"bg-gold":"bg-white/15"}`} />
          ))}
        </div>
        <div className="px-5 mt-3 text-xs text-white/60">Step {step+1} of 4 · {STEPS[step].t}</div>

        <div className="px-5 mt-6 space-y-3">
          {step===0 && (<>
            <Field label="Legal name" placeholder="Marcus Vega" />
            <Field label="Craft" placeholder="Barber, Stylist, Lash Tech…" />
            <Field label="City" placeholder="Los Angeles, CA" />
            <Field label="Years experience" placeholder="12" />
            <Field label="Bio" multi placeholder="Tell clients about your style and specialty." />
          </>)}

          {step===1 && (<>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-[10px] uppercase tracking-widest text-white/50">State license</div>
              <Field label="License number" placeholder="CA-BARB-44912" />
              <Field label="State / region" placeholder="California" />
              <button className="mt-3 w-full py-6 rounded-2xl border border-dashed border-white/20 text-sm text-white/70 flex items-center justify-center gap-2"><Upload className="h-4 w-4" />Upload license photo</button>
              <div className="mt-3 text-[10px] text-white/50">Verified within 24 hours by our trust team.</div>
            </div>
          </>)}

          {step===2 && (<>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-gold" /><span className="text-sm">Identity verification</span></div>
              <p className="text-xs text-white/60 mt-2">Powered by Persona. Takes 60 seconds.</p>
              <button className="mt-4 w-full py-6 rounded-2xl border border-dashed border-white/20 text-sm text-white/70 flex items-center justify-center gap-2"><Upload className="h-4 w-4" />Scan government ID</button>
              <button className="mt-2 w-full py-6 rounded-2xl border border-dashed border-white/20 text-sm text-white/70 flex items-center justify-center gap-2"><Upload className="h-4 w-4" />Take selfie</button>
              <label className="mt-4 flex items-start gap-2 text-xs text-white/70">
                <input type="checkbox" className="mt-0.5" /> I consent to a background check (required for mobile services).
              </label>
            </div>
          </>)}

          {step===3 && (<>
            <div className="text-[10px] uppercase tracking-widest text-white/50">Add a service</div>
            <Field label="Service name" placeholder="Signature Cut" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price ($)" placeholder="75" />
              <Field label="Minutes" placeholder="45" />
            </div>
            <button className="w-full py-3 rounded-2xl border border-dashed border-white/20 text-sm text-white/70">+ Add another service</button>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mt-4">
              <div className="font-medium text-sm">Sanitation pledge</div>
              <p className="text-xs text-white/60 mt-2">I will use new, sealed, or hospital-grade disinfected tools at every appointment. I will never use reused, unsafe, or unsanitized supplies.</p>
              <label className="mt-3 flex items-start gap-2 text-xs">
                <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} className="mt-0.5" />
                <span>I agree to the Boujee Book™ Sanitation Standard and Pro Code of Conduct.</span>
              </label>
            </div>
          </>)}
        </div>

        <div className="px-5 mt-8 flex items-center gap-3">
          {step>0 && <button onClick={()=>setStep(step-1)} className="flex-1 py-3 rounded-full border border-white/20 text-sm">Back</button>}
          {step<3 ? (
            <button onClick={()=>setStep(step+1)} className="flex-1 py-3 rounded-full bg-gold text-ink text-sm font-medium">Continue</button>
          ) : (
            <Link to="/pro" className={`flex-1 py-3 rounded-full text-sm font-medium text-center ${agreed?"bg-gold text-ink":"bg-white/10 text-white/40 pointer-events-none"}`}>
              <Check className="inline h-4 w-4 mr-1" />Submit for review
            </Link>
          )}
        </div>
      </div>
      <ProTabs />
    </AppShell>
  );
}

function Field({ label, placeholder, multi }: { label: string; placeholder?: string; multi?: boolean }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest text-white/50">{label}</label>
      {multi
        ? <textarea rows={3} placeholder={placeholder} className="mt-1 w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-sm outline-none resize-none text-white placeholder:text-white/30" />
        : <input placeholder={placeholder} className="mt-1 w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-sm outline-none text-white placeholder:text-white/30" />
      }
    </div>
  );
}
