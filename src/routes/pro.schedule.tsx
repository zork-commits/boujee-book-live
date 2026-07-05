import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/boujee/AppShell";
import { ProTabs } from "@/components/boujee/ProTabs";
import { useProBookings } from "@/lib/api";

export const Route = createFileRoute("/pro/schedule")({ component: Schedule });

const HOURS = Array.from({length:12}).map((_,i)=>`${(i+8).toString().padStart(2,"0")}:00`);

const dayRange = (offset: number) => {
  const from = new Date(); from.setDate(from.getDate() + offset); from.setHours(0,0,0,0);
  const to = new Date(from); to.setDate(to.getDate() + 1);
  return { from: from.toISOString(), to: to.toISOString() };
};

function Schedule() {
  const [dayOffset, setDayOffset] = useState(0);
  const { data: appointments } = useProBookings(dayRange(dayOffset));

  const dates = Array.from({length:7}).map((_,i)=>{
    const d = new Date(); d.setDate(d.getDate()+i);
    return { day: d.toLocaleDateString("en",{weekday:"short"}), num: d.getDate() };
  });

  const active = (appointments ?? []).filter((a) => a.booking.status !== "cancelled");

  return (
    <AppShell dark>
      <header className="px-5 pt-6 pb-3 text-white">
        <h1 className="font-display text-3xl">Schedule</h1>
      </header>
      <div className="px-5 mt-2 flex gap-2 overflow-x-auto no-scrollbar">
        {dates.map((d,i)=>(
          <button key={i} onClick={()=>setDayOffset(i)} className={`shrink-0 w-14 py-3 rounded-2xl text-center ${i===dayOffset?"bg-gold text-ink":"bg-white/5 text-white border border-white/10"}`}>
            <div className="text-[10px] uppercase tracking-widest opacity-70">{d.day}</div>
            <div className="font-display text-xl mt-1">{d.num}</div>
          </button>
        ))}
      </div>
      <div className="px-5 mt-5 text-white">
        <div className="relative">
          {HOURS.map(h=>(
            <div key={h} className="flex gap-3 border-t border-white/5 py-2 text-[10px] text-white/30">
              <span className="w-10">{h}</span>
              <div className="flex-1" />
            </div>
          ))}
          {active.map((a)=>{
            const at = new Date(a.booking.scheduledAt);
            const top = (at.getHours() - 8) * 32 + (at.getMinutes() / 60) * 32;
            if (top < 0 || top > HOURS.length * 32) return null;
            return (
              <div key={a.booking.id} className="absolute left-12 right-0 rounded-xl bg-gold/90 text-ink p-2 text-[11px] shadow-luxury" style={{ top, minHeight: (a.booking.mins/30)*16 + 16 }}>
                <div className="font-medium">{a.clientName}</div>
                <div className="opacity-70">{a.booking.serviceName} · ${a.booking.price}{a.booking.status === "pending" ? " · pending" : ""}</div>
              </div>
            );
          })}
          {active.length === 0 && (
            <div className="absolute inset-x-0 top-24 text-center text-sm text-white/40">Nothing booked this day.</div>
          )}
        </div>
      </div>
      <ProTabs />
    </AppShell>
  );
}
