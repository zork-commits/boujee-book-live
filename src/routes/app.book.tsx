import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/boujee/AppShell";
import { getPro } from "@/fn/pros";
import { useCreateBooking, useBookableSlots } from "@/lib/api";
import { ChevronLeft, MapPin, Check, CreditCard, Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/book")({
  validateSearch: (s: Record<string, unknown>): { pro: string; service?: string } => ({
    pro: (s.pro as string) || "",
    service: typeof s.service === "string" && s.service ? s.service : undefined,
  }),
  loaderDeps: ({ search }) => ({ pro: search.pro }),
  loader: async ({ deps }) => {
    const pro = await getPro({ data: { id: deps.pro } });
    if (!pro) throw new Error("Pro not found");
    return { pro };
  },
  component: Booking,
});

const STEPS = ["Service","Date","Time","Location","Pay"];

function Booking() {
  const { pro } = Route.useLoaderData();
  const { service: initialServiceId } = Route.useSearch();
  const [step, setStep] = useState(initialServiceId ? 1 : 0);
  const [serviceId, setServiceId] = useState(initialServiceId || pro.services[0]?.id || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [where, setWhere] = useState<"shop"|"mobile">("shop");
  const [pay, setPay] = useState("apple");
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();
  const createBooking = useCreateBooking();
  const svc = pro.services.find(s=>s.id===serviceId) || pro.services[0];

  const dates = Array.from({length:7}).map((_,i)=>{
    const d = new Date(); d.setDate(d.getDate()+i);
    return { iso: d.toISOString().slice(0,10), day: d.toLocaleDateString("en",{weekday:"short"}), num: d.getDate() };
  });
  // Real availability: the pro's working hours minus existing bookings.
  const { data: slotData, isLoading: slotsLoading } = useBookableSlots(
    date && svc ? { proId: pro.id, serviceId: svc.id, date } : null,
  );
  const times = slotData?.slots ?? [];

  const canContinue = [!!serviceId, !!date, !!time, true, true][step];

  const confirm = async () => {
    setError(null);
    const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
    try {
      const res = await createBooking.mutateAsync({
        proId: pro.id,
        serviceId: svc.id,
        scheduledAt,
        location: where,
      });
      if (!res.ok) { setError(res.error); return; }
      nav({ to: "/app/bookings" });
    } catch {
      setError("Something went wrong — try again.");
    }
  };

  return (
    <AppShell>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <button onClick={()=>step>0?setStep(step-1):nav({to:"/app/p/$id",params:{id:pro.id}})} className="h-9 w-9 grid place-items-center rounded-full border border-border"><ChevronLeft className="h-4 w-4" /></button>
        <div className="text-xs text-muted-foreground">Step {step+1} of {STEPS.length}</div>
      </header>

      <div className="px-5 mt-2">
        <div className="flex gap-1.5">
          {STEPS.map((_,i)=>(<div key={i} className={`h-1 flex-1 rounded-full ${i<=step?"bg-gold":"bg-border"}`} />))}
        </div>
        <h1 className="mt-5 font-display text-2xl">{STEPS[step]}</h1>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <img src={pro.avatar} className="h-5 w-5 rounded-full object-cover" alt="" />{pro.name} · {pro.craft}
        </div>
      </div>

      <div className="px-5 mt-6 min-h-[320px]">
        {step===0 && (
          <div className="space-y-2">
            {pro.services.map(s=>(
              <button key={s.id} onClick={()=>setServiceId(s.id)} className={`w-full flex items-center justify-between p-4 rounded-2xl border ${serviceId===s.id?"border-ink bg-ink text-white":"border-border"}`}>
                <div className="text-left">
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className={`text-[11px] ${serviceId===s.id?"text-white/60":"text-muted-foreground"}`}>{s.mins} min</div>
                </div>
                <div className="text-sm">${s.price}</div>
              </button>
            ))}
          </div>
        )}
        {step===1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {dates.map(d=>(
              <button key={d.iso} onClick={()=>{ setDate(d.iso); setTime(""); }} className={`shrink-0 w-16 py-4 rounded-2xl border text-center ${date===d.iso?"border-ink bg-ink text-white":"border-border"}`}>
                <div className="text-[10px] uppercase tracking-widest opacity-70">{d.day}</div>
                <div className="font-display text-2xl mt-1">{d.num}</div>
              </button>
            ))}
          </div>
        )}
        {step===2 && (
          <div>
            {slotsLoading && <div className="py-8 grid place-items-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>}
            {!slotsLoading && times.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {pro.name.split(" ")[0]} is fully booked or closed that day — try another date.
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              {times.map(t=>(
                <button key={t} onClick={()=>setTime(t)} className={`py-3 rounded-xl border text-sm ${time===t?"border-ink bg-ink text-white":"border-border"}`}>{t}</button>
              ))}
            </div>
          </div>
        )}
        {step===3 && (
          <div className="space-y-2">
            <button onClick={()=>setWhere("shop")} className={`w-full text-left p-4 rounded-2xl border ${where==="shop"?"border-ink bg-ink text-white":"border-border"}`}>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><div className="font-medium text-sm">In Shop</div></div>
              <div className={`text-[11px] mt-1 ${where==="shop"?"text-white/60":"text-muted-foreground"}`}>{pro.city}</div>
            </button>
            {pro.mobile && (
              <button onClick={()=>setWhere("mobile")} className={`w-full text-left p-4 rounded-2xl border ${where==="mobile"?"border-ink bg-ink text-white":"border-border"}`}>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><div className="font-medium text-sm">Mobile · Pro comes to you</div></div>
                <div className={`text-[11px] mt-1 ${where==="mobile"?"text-white/60":"text-muted-foreground"}`}>+$25 travel fee</div>
              </button>
            )}
          </div>
        )}
        {step===4 && (
          <div>
            <div className="space-y-2">
              {[{k:"apple",l:" Pay",h:"Apple Pay"},{k:"google",l:"G Pay",h:"Google Pay"},{k:"card",l:"•••• 4242",h:"Visa"}].map(p=>(
                <button key={p.k} onClick={()=>setPay(p.k)} className={`w-full flex items-center justify-between p-4 rounded-2xl border ${pay===p.k?"border-ink bg-ink text-white":"border-border"}`}>
                  <div className="flex items-center gap-3"><CreditCard className="h-4 w-4" /><div className="text-sm font-medium">{p.h}</div></div>
                  <div className="text-xs opacity-60">{p.l}</div>
                </button>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-border p-4 space-y-2 text-sm">
              <Row k={svc.name} v={`$${svc.price}`} />
              {where==="mobile" && <Row k="Mobile fee" v="$25" />}
              <Row k="Service fee" v="$4" />
              <div className="border-t border-border pt-2 mt-2 flex justify-between font-medium"><span>Total</span><span>${svc.price + (where==="mobile"?25:0) + 4}</span></div>
            </div>
            <div className="mt-3 text-[10px] text-muted-foreground text-center">
              {date && time ? `${new Date(`${date}T${time}:00`).toLocaleString("en-US",{weekday:"long",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}` : ""}
            </div>
            {error && <div className="mt-2 text-xs text-destructive text-center">{error}</div>}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-30 mt-auto border-t border-border bg-background/95 backdrop-blur-xl px-5 py-3">
        {step < 4 ? (
          <button disabled={!canContinue} onClick={()=>setStep(step+1)} className="w-full h-12 rounded-full bg-ink text-white font-medium text-sm disabled:opacity-40">Continue</button>
        ) : (
          <button onClick={confirm} disabled={createBooking.isPending} className="w-full h-12 rounded-full bg-gold text-ink font-medium text-sm grid place-items-center disabled:opacity-60">
            <span className="inline-flex items-center gap-2">
              {createBooking.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Confirm & Pay
            </span>
          </button>
        )}
      </div>
    </AppShell>
  );
}

function Row({k,v}:{k:string;v:string}) { return <div className="flex justify-between text-muted-foreground"><span>{k}</span><span className="text-foreground">{v}</span></div>; }
