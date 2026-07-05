import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/groom/AppShell";
import { AppTabs } from "@/components/groom/AppTabs";
import { Sparkles, Send } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/ai")({
  component: AI,
});

const SEED = [
  { who:"ai", t:"Hi Maya. I'm your AI beauty concierge. Tell me what you're going for." },
];

const PRESETS = ["Bridal soft glam","Bold red curls","Clean skin fade","Almond Gel-X","Lash refresh"];

function AI() {
  const [msgs, setMsgs] = useState(SEED);
  const [v, setV] = useState("");
  function send(text: string) {
    if (!text.trim()) return;
    setMsgs(m=>[...m, {who:"me",t:text}, {who:"ai",t:"Based on your hair tone and shape, I'd start with a low-maintenance balayage and recommend Amara Cole in Brooklyn — she has 4.97★. Want me to hold Friday 11am?"}]);
    setV("");
  }
  return (
    <AppShell dark>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gold/20 grid place-items-center"><Sparkles className="h-4 w-4 text-gold" /></div>
        <div>
          <div className="font-display text-xl text-white">GROOM AI</div>
          <div className="text-[10px] uppercase tracking-widest text-white/40">Always on</div>
        </div>
      </header>
      <div className="px-5 mt-3 space-y-3">
        {msgs.map((m,i)=>(
          <div key={i} className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.who==="ai"?"bg-white/10 text-white":"ml-auto bg-gold text-ink"}`}>{m.t}</div>
        ))}
      </div>
      <div className="mt-5 px-5 flex gap-2 overflow-x-auto no-scrollbar">
        {PRESETS.map(p=>(
          <button key={p} onClick={()=>send(p)} className="shrink-0 px-3.5 py-2 rounded-full text-xs border border-white/20 text-white">{p}</button>
        ))}
      </div>
      <div className="mt-6 px-5">
        <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5">
          <input value={v} onChange={e=>setV(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send(v)} placeholder="Describe the look…" className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 outline-none" />
          <button onClick={()=>send(v)} className="h-8 w-8 rounded-full bg-gold grid place-items-center"><Send className="h-3.5 w-3.5 text-ink" /></button>
        </div>
      </div>
      <AppTabs />
    </AppShell>
  );
}
