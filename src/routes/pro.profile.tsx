import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/boujee/AppShell";
import { ProTabs } from "@/components/boujee/ProTabs";
import { usePro, useAddService, useDeleteService, useUpdateProProfile, useLogout } from "@/lib/api";
import { Plus, Camera, Star, Trash2, Loader2, Check, LogOut, MapPin, BadgeCheck } from "lucide-react";
import { toast } from "sonner";

const uploadToast = () =>
  toast("Photo uploads coming soon", { description: "Cover, avatar, and portfolio uploads open once media storage is connected." });

export const Route = createFileRoute("/pro/profile")({ component: Studio });

function Studio() {
  const { user } = Route.useRouteContext();
  const { data: pro, isLoading } = usePro(user.proId!);
  const addService = useAddService();
  const deleteService = useDeleteService();
  const updateProfile = useUpdateProProfile();
  const logout = useLogout();
  const nav = useNavigate();

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", price: "", mins: "" });
  const [bioDraft, setBioDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (isLoading || !pro) {
    return (
      <AppShell dark>
        <div className="min-h-[600px] grid place-items-center text-white/50"><Loader2 className="h-6 w-6 animate-spin" /></div>
        <ProTabs />
      </AppShell>
    );
  }

  const submitService = async () => {
    setError(null);
    const price = parseInt(draft.price, 10);
    const mins = parseInt(draft.mins, 10);
    if (!draft.name.trim() || !(price > 0) || !(mins > 0)) { setError("Fill in name, price, and minutes."); return; }
    const res = await addService.mutateAsync({ name: draft.name.trim(), price, mins });
    if (res.ok) { setDraft({ name: "", price: "", mins: "" }); setAdding(false); }
  };

  const saveBio = async () => {
    if (bioDraft == null) return;
    await updateProfile.mutateAsync({ bio: bioDraft.trim() });
    setBioDraft(null);
  };

  const signOut = async () => {
    await logout.mutateAsync();
    nav({ to: "/" });
  };

  return (
    <AppShell dark>
      <div className="relative">
        <img src={pro.cover} alt="" className="aspect-[16/9] w-full object-cover opacity-60" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink to-transparent h-32" />
        <button onClick={uploadToast} className="absolute bottom-3 right-3 h-9 px-3 rounded-full bg-ink/80 text-white text-xs inline-flex items-center gap-1.5"><Camera className="h-3.5 w-3.5" />Edit cover</button>
      </div>
      <div className="px-5 -mt-12 relative text-white">
        <img src={pro.avatar} alt="" className="h-20 w-20 rounded-2xl object-cover ring-4 ring-ink" />
        <div className="mt-3 font-display text-2xl flex items-center gap-2">
          {pro.name}
          {pro.verified
            ? <BadgeCheck className="h-4 w-4 text-gold" />
            : <span className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] tracking-widest uppercase text-white/60">Verification pending</span>}
        </div>
        <div className="text-xs text-white/60 flex items-center gap-1">{pro.craft} · <MapPin className="h-3 w-3" />{pro.city}</div>
        <div className="mt-2 text-xs inline-flex items-center gap-1"><Star className="h-3 w-3 fill-gold text-gold" />{pro.rating} ({pro.reviewCount})</div>
      </div>

      <section className="mt-6 px-5 text-white">
        <h2 className="font-display text-xl mb-3">About</h2>
        {bioDraft == null ? (
          <button onClick={() => setBioDraft(pro.bio)} className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-white/80">
            {pro.bio || "Add a bio so clients know your style — tap to edit."}
          </button>
        ) : (
          <div className="rounded-2xl bg-white/5 border border-gold/40 p-3">
            <textarea
              rows={3}
              value={bioDraft}
              onChange={(e) => setBioDraft(e.target.value)}
              className="w-full bg-transparent text-sm outline-none resize-none text-white"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setBioDraft(null)} className="px-3 py-1.5 rounded-full border border-white/20 text-xs">Cancel</button>
              <button onClick={saveBio} disabled={updateProfile.isPending} className="px-3 py-1.5 rounded-full bg-gold text-ink text-xs font-medium inline-flex items-center gap-1 disabled:opacity-60">
                {updateProfile.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}Save
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 px-5 text-white">
        <h2 className="font-display text-xl mb-3">Services & pricing</h2>
        <div className="space-y-2">
          {pro.services.map(s=>(
            <div key={s.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
              <div>
                <div className="text-sm font-medium">{s.name}</div>
                <div className="text-[11px] text-white/50">{s.mins}min · ${s.price}</div>
              </div>
              <button
                onClick={async () => {
                  setError(null);
                  const res = await deleteService.mutateAsync(s.id);
                  if (!res.ok) setError(res.error);
                }}
                disabled={deleteService.isPending}
                className="h-8 w-8 rounded-full bg-white/5 grid place-items-center disabled:opacity-40"
                aria-label={`Remove ${s.name}`}
              >
                <Trash2 className="h-3.5 w-3.5 text-white/50" />
              </button>
            </div>
          ))}

          {adding ? (
            <div className="rounded-2xl bg-white/5 border border-gold/40 p-4 space-y-2">
              <input value={draft.name} onChange={(e)=>setDraft(d=>({...d,name:e.target.value}))} placeholder="Service name" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm outline-none text-white placeholder:text-white/30" autoFocus />
              <div className="grid grid-cols-2 gap-2">
                <input value={draft.price} onChange={(e)=>setDraft(d=>({...d,price:e.target.value}))} placeholder="Price ($)" inputMode="numeric" className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm outline-none text-white placeholder:text-white/30" />
                <input value={draft.mins} onChange={(e)=>setDraft(d=>({...d,mins:e.target.value}))} placeholder="Minutes" inputMode="numeric" className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm outline-none text-white placeholder:text-white/30" />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button onClick={() => { setAdding(false); setError(null); }} className="px-3 py-1.5 rounded-full border border-white/20 text-xs">Cancel</button>
                <button onClick={submitService} disabled={addService.isPending} className="px-3 py-1.5 rounded-full bg-gold text-ink text-xs font-medium inline-flex items-center gap-1 disabled:opacity-60">
                  {addService.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}Add
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} className="w-full py-3 rounded-2xl border border-dashed border-white/20 text-white/70 text-sm inline-flex items-center justify-center gap-1.5"><Plus className="h-4 w-4" />Add service</button>
          )}
          {error && <div className="text-xs text-red-400">{error}</div>}
        </div>
      </section>

      {pro.portfolio.length > 0 && (
        <section className="mt-6 px-5 text-white">
          <h2 className="font-display text-xl mb-3">Portfolio</h2>
          <div className="grid grid-cols-3 gap-1.5">
            {pro.portfolio.map((src,i)=>(
              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-white/5"><img src={src} alt="" className="h-full w-full object-cover" /></div>
            ))}
            <button onClick={uploadToast} aria-label="Add portfolio photo" className="aspect-square rounded-xl border border-dashed border-white/20 grid place-items-center"><Plus className="h-5 w-5 text-white/60" /></button>
          </div>
        </section>
      )}

      <section className="mt-6 px-5 text-white">
        <h2 className="font-display text-xl mb-3">Booking preferences</h2>
        <div className="rounded-2xl bg-white/5 border border-white/10 divide-y divide-white/5">
          <Toggle
            label="In-shop appointments"
            checked={pro.inShop}
            onChange={(v) => updateProfile.mutate({ inShop: v })}
          />
          <Toggle
            label="Mobile — I travel to clients"
            checked={pro.mobile}
            onChange={(v) => updateProfile.mutate({ mobile: v })}
          />
        </div>
      </section>

      <button
        onClick={signOut}
        disabled={logout.isPending}
        className="mt-6 mx-5 mb-4 w-[calc(100%-2.5rem)] flex items-center justify-center gap-2 py-3 rounded-2xl border border-white/10 text-sm text-red-400 disabled:opacity-50"
      >
        <LogOut className="h-4 w-4" />Sign out
      </button>
      <ProTabs />
    </AppShell>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between p-3 text-sm cursor-pointer">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`h-6 w-11 rounded-full transition-colors relative ${checked ? "bg-gold" : "bg-white/15"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-ink transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </label>
  );
}
