import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/boujee/AppShell";
import { useBecomePro } from "@/lib/api";
import { CRAFTS } from "@/fn/pro-profile";
import { Check, Upload, ShieldCheck, IdCard, Sparkles, Scissors, Trash2, Loader2 } from "lucide-react";

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

type ServiceDraft = { name: string; price: string; mins: string };

function Onboarding() {
  const nav = useNavigate();
  const becomePro = useBecomePro();
  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [craft, setCraft] = useState<string>(CRAFTS[0].craft);
  const [city, setCity] = useState("");
  const [years, setYears] = useState("");
  const [bio, setBio] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseRegion, setLicenseRegion] = useState("");
  const [mobile, setMobile] = useState(false);
  const [servicesDraft, setServicesDraft] = useState<ServiceDraft[]>([{ name: "", price: "", mins: "" }]);

  const setService = (i: number, patch: Partial<ServiceDraft>) =>
    setServicesDraft((list) => list.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  const validServices = servicesDraft
    .map((s) => ({ name: s.name.trim(), price: parseInt(s.price, 10), mins: parseInt(s.mins, 10) }))
    .filter((s) => s.name && s.price > 0 && s.mins > 0);

  const stepValid = [
    name.trim().length > 0 && city.trim().length > 0,
    true, // license optional until trust-team verification is wired
    true,
    validServices.length > 0 && agreed,
  ][step];

  const submit = async () => {
    setError(null);
    try {
      const res = await becomePro.mutateAsync({
        name: name.trim(),
        craft,
        city: city.trim(),
        years: Math.max(0, parseInt(years, 10) || 0),
        bio: bio.trim(),
        licenseNumber: licenseNumber.trim() || undefined,
        licenseRegion: licenseRegion.trim() || undefined,
        mobile,
        inShop: true,
        services: validServices,
      });
      if (!res.ok) { setError(res.error); return; }
      nav({ to: "/pro", replace: true });
    } catch {
      setError("Could not submit your application — try again.");
    }
  };

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

        <div className="px-5 mt-6 space-y-3 pb-4">
          {step===0 && (<>
            <Field label="Display name" placeholder="Marcus Vega" value={name} onChange={setName} />
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/50">Craft</label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {CRAFTS.map((c) => (
                  <button
                    key={c.craft}
                    type="button"
                    onClick={() => setCraft(c.craft)}
                    className={`px-3 py-2.5 rounded-xl border text-xs text-left ${craft === c.craft ? "border-gold bg-gold/15 text-gold" : "border-white/10 bg-white/5 text-white/70"}`}
                  >
                    {c.craft}
                  </button>
                ))}
              </div>
            </div>
            <Field label="City" placeholder="Los Angeles, CA" value={city} onChange={setCity} />
            <Field label="Years experience" placeholder="12" value={years} onChange={setYears} inputMode="numeric" />
            <Field label="Bio" multi placeholder="Tell clients about your style and specialty." value={bio} onChange={setBio} />
            <label className="flex items-start gap-2 text-xs text-white/70">
              <input type="checkbox" checked={mobile} onChange={(e)=>setMobile(e.target.checked)} className="mt-0.5" />
              I offer mobile appointments (I travel to clients).
            </label>
          </>)}

          {step===1 && (<>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-[10px] uppercase tracking-widest text-white/50">State license</div>
              <Field label="License number" placeholder="CA-BARB-44912" value={licenseNumber} onChange={setLicenseNumber} />
              <Field label="State / region" placeholder="California" value={licenseRegion} onChange={setLicenseRegion} />
              <button type="button" className="mt-3 w-full py-6 rounded-2xl border border-dashed border-white/20 text-sm text-white/70 flex items-center justify-center gap-2"><Upload className="h-4 w-4" />Upload license photo</button>
              <div className="mt-3 text-[10px] text-white/50">Verified within 24 hours by our trust team. You can start taking bookings right away — the verified badge appears after review.</div>
            </div>
          </>)}

          {step===2 && (<>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-gold" /><span className="text-sm">Identity verification</span></div>
              <p className="text-xs text-white/60 mt-2">Powered by Persona. Takes 60 seconds.</p>
              <button type="button" className="mt-4 w-full py-6 rounded-2xl border border-dashed border-white/20 text-sm text-white/70 flex items-center justify-center gap-2"><Upload className="h-4 w-4" />Scan government ID</button>
              <button type="button" className="mt-2 w-full py-6 rounded-2xl border border-dashed border-white/20 text-sm text-white/70 flex items-center justify-center gap-2"><Upload className="h-4 w-4" />Take selfie</button>
              <label className="mt-4 flex items-start gap-2 text-xs text-white/70">
                <input type="checkbox" className="mt-0.5" /> I consent to a background check (required for mobile services).
              </label>
            </div>
          </>)}

          {step===3 && (<>
            <div className="text-[10px] uppercase tracking-widest text-white/50">Your service menu</div>
            {servicesDraft.map((s, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/50">Service {i + 1}</div>
                  {servicesDraft.length > 1 && (
                    <button type="button" onClick={() => setServicesDraft((l) => l.filter((_, j) => j !== i))} aria-label="Remove service">
                      <Trash2 className="h-3.5 w-3.5 text-white/50" />
                    </button>
                  )}
                </div>
                <Field label="Service name" placeholder="Signature Cut" value={s.name} onChange={(v)=>setService(i,{name:v})} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Price ($)" placeholder="75" value={s.price} onChange={(v)=>setService(i,{price:v})} inputMode="numeric" />
                  <Field label="Minutes" placeholder="45" value={s.mins} onChange={(v)=>setService(i,{mins:v})} inputMode="numeric" />
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setServicesDraft((l) => [...l, { name: "", price: "", mins: "" }])} className="w-full py-3 rounded-2xl border border-dashed border-white/20 text-sm text-white/70">+ Add another service</button>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mt-4">
              <div className="font-medium text-sm">Sanitation pledge</div>
              <p className="text-xs text-white/60 mt-2">I will use new, sealed, or hospital-grade disinfected tools at every appointment. I will never use reused, unsafe, or unsanitized supplies.</p>
              <label className="mt-3 flex items-start gap-2 text-xs">
                <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} className="mt-0.5" />
                <span>I agree to the Boujee Book™ Sanitation Standard and Pro Code of Conduct.</span>
              </label>
            </div>
            {error && <div className="text-xs text-red-400">{error}</div>}
          </>)}
        </div>

        <div className="px-5 mt-4 pb-8 flex items-center gap-3">
          {step>0 && <button onClick={()=>setStep(step-1)} className="flex-1 py-3 rounded-full border border-white/20 text-sm">Back</button>}
          {step<3 ? (
            <button onClick={()=>setStep(step+1)} disabled={!stepValid} className="flex-1 py-3 rounded-full bg-gold text-ink text-sm font-medium disabled:opacity-40">Continue</button>
          ) : (
            <button
              onClick={submit}
              disabled={!stepValid || becomePro.isPending}
              className="flex-1 py-3 rounded-full text-sm font-medium text-center bg-gold text-ink disabled:bg-white/10 disabled:text-white/40"
            >
              {becomePro.isPending
                ? <Loader2 className="inline h-4 w-4 animate-spin" />
                : <><Check className="inline h-4 w-4 mr-1" />Submit & open my studio</>}
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, placeholder, multi, value, onChange, inputMode }: {
  label: string; placeholder?: string; multi?: boolean;
  value: string; onChange: (v: string) => void;
  inputMode?: "numeric";
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest text-white/50">{label}</label>
      {multi
        ? <textarea rows={3} placeholder={placeholder} value={value} onChange={(e)=>onChange(e.target.value)} className="mt-1 w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-sm outline-none resize-none text-white placeholder:text-white/30 focus:border-gold/60" />
        : <input placeholder={placeholder} value={value} onChange={(e)=>onChange(e.target.value)} inputMode={inputMode} className="mt-1 w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-sm outline-none text-white placeholder:text-white/30 focus:border-gold/60" />
      }
    </div>
  );
}
