import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkline } from "@/components/boujee/Sparkline";
import { ADMIN_KPI, DISPUTES } from "@/lib/mock";
import { getMe, logout as logoutFn } from "@/fn/auth";
import { adminOverview, adminListPros, adminSetVerification } from "@/fn/admin";
import { initials } from "@/lib/api";
import { LayoutDashboard, ShieldCheck, Users, AlertTriangle, BarChart3, Search, Check, X, Calendar, CreditCard, Settings, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Boujee Book" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async ({ location }) => {
    const user = await getMe();
    // Non-admins land on the auth screen so they can switch to the admin account.
    if (!user || user.role !== "admin") throw redirect({ to: "/auth", search: { redirect: location.href } });
    return { user };
  },
  component: Admin,
});

function useAdminPros() {
  return useQuery({ queryKey: ["adminPros"], queryFn: () => adminListPros() });
}
function useAdminOverview() {
  return useQuery({ queryKey: ["adminOverview"], queryFn: () => adminOverview() });
}
function useSetVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { proId: string; action: "approve" | "reject" }) => adminSetVerification({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminPros"] });
      qc.invalidateQueries({ queryKey: ["adminOverview"] });
      qc.invalidateQueries({ queryKey: ["pros"] });
    },
  });
}

const NAV = [
  { id:"dash", l:"Overview", i:LayoutDashboard },
  { id:"users", l:"Users", i:Users },
  { id:"pros", l:"Providers", i:ShieldCheck },
  { id:"bookings", l:"Bookings", i:Calendar },
  { id:"payments", l:"Payments", i:CreditCard },
  { id:"disputes", l:"Disputes", i:AlertTriangle },
  { id:"analytics", l:"Analytics", i:BarChart3 },
  { id:"settings", l:"Settings", i:Settings },
];

function Admin() {
  const { user } = Route.useRouteContext();
  const [tab, setTab] = useState("dash");
  return (
    <div className="min-h-screen bg-cream flex">
      <aside className="hidden md:flex flex-col w-60 bg-ink text-white p-5 sticky top-0 h-screen">
        <Link to="/" className="font-display text-xl tracking-[0.25em] text-gold">BOUJEE BOOK<sup className="text-[9px] tracking-normal opacity-60">™</sup></Link>
        <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">Admin Console</div>
        <nav className="mt-8 space-y-1 flex-1">
          {NAV.map(n=>{const I=n.i;return(
            <button key={n.id} onClick={()=>setTab(n.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${tab===n.id?"bg-white/10 text-gold":"text-white/70 hover:bg-white/5"}`}>
              <I className="h-4 w-4" />{n.l}
            </button>
          )})}
        </nav>
        <div className="text-[10px] text-white/40">v1.0 · prod</div>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="border-b border-border bg-background px-4 md:px-6 py-4 flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-cream px-4 py-2 flex-1 max-w-md"><Search className="h-4 w-4 text-muted-foreground" /><input placeholder="Search (use tab filters below)" className="bg-transparent text-sm outline-none flex-1" /></div>
          <div className="flex-1 sm:hidden font-display tracking-[0.2em] text-sm">BOUJEE ADMIN</div>
          <div className="hidden sm:block text-xs text-muted-foreground">{user.name} · Admin</div>
          <div className="h-9 w-9 rounded-full bg-ink text-white grid place-items-center text-xs">{initials(user.name)}</div>
          <button
            onClick={async () => { await logoutFn(); window.location.href = "/"; }}
            aria-label="Sign out"
            className="h-9 px-3 rounded-full border border-border text-xs inline-flex items-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </header>

        {/* Mobile tab strip — the sidebar is hidden below md, so navigation must live here */}
        <nav className="md:hidden border-b border-border bg-background px-3 py-2 flex gap-1.5 overflow-x-auto no-scrollbar">
          {NAV.map(n=>{const I=n.i;return(
            <button key={n.id} onClick={()=>setTab(n.id)} className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs ${tab===n.id?"bg-ink text-white":"border border-border"}`}>
              <I className="h-3.5 w-3.5" />{n.l}
            </button>
          )})}
        </nav>

        <div className="p-6 lg:p-8">
          {tab==="dash" && <Overview />}
          {tab==="pros" && <ProsTab />}
          {tab==="users" && <UsersTab />}
          {tab==="bookings" && <BookingsTab />}
          {tab==="payments" && <PaymentsTab />}
          {tab==="disputes" && <DisputesTab />}
          {tab==="analytics" && <Overview />}
          {tab==="settings" && <SettingsTab />}
        </div>
      </main>
    </div>
  );
}

function KPI({ label, value, delta }: { label:string; value:string; delta:string }) {
  return (
    <div className="rounded-2xl bg-background border border-border p-5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-3xl mt-1">{value}</div>
      <div className="text-[11px] text-gold mt-1">{delta}</div>
    </div>
  );
}

function Overview() {
  const { data } = useAdminOverview();
  return (
    <div>
      <h1 className="font-display text-3xl">Overview</h1>
      <div className="text-sm text-muted-foreground">Live platform totals · demo projections marked</div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        <KPI label="GMV (live)" value={data ? `$${data.gmv.toLocaleString()}` : "…"} delta="all time" />
        <KPI label="Bookings (live)" value={data ? data.bookings.toLocaleString() : "…"} delta="all time" />
        <KPI label="Users (live)" value={data ? data.users.toLocaleString() : "…"} delta="all time" />
        <KPI label="Active pros (live)" value={data ? data.activePros.toLocaleString() : "…"} delta={`${data?.pendingPros.length ?? 0} pending`} />
        <KPI label="Net revenue (demo)" value={`$${(ADMIN_KPI.take/1e3).toFixed(0)}K`} delta="+24.1%" />
        <KPI label="MRR (demo)" value={`$${(ADMIN_KPI.mrr/1e3).toFixed(0)}K`} delta="+18.4%" />
        <KPI label="Take rate" value="15.0%" delta="stable" />
        <KPI label="NPS (demo)" value="71" delta="+4" />
      </div>
      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <div className="lg:col-span-2 rounded-2xl bg-background border border-border p-6">
          <div className="flex items-center justify-between">
            <div><div className="text-xs uppercase tracking-widest text-muted-foreground">GMV trend (12 mo)</div><div className="font-display text-2xl mt-1">$4.28M this month</div></div>
            <select className="text-xs rounded-full border border-border px-3 py-1.5"><option>All cities</option></select>
          </div>
          <div className="mt-6 text-ink"><Sparkline data={[120,168,210,260,305,360,405,460,520,580,640,712]} height={140} /></div>
        </div>
        <div className="rounded-2xl bg-background border border-border p-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Pipeline</div>
          <div className="mt-3 space-y-3 text-sm">
            {[["Pending review", data?.pendingPros.length ?? 0], ["Open disputes (demo)", DISPUTES.length], ["License re-verify", data?.pendingPros.length ?? 0], ["Refunds queue", 0]].map(([l,n])=>(
              <div key={l as string} className="flex justify-between"><span className="text-muted-foreground">{l}</span><span className="font-medium">{n}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProsTab() {
  const { data, isLoading } = useAdminPros();
  const setVerification = useSetVerification();
  const [filter, setFilter] = useState<"pending" | "active" | "all">("pending");

  const rows = (data ?? []).filter((r) =>
    filter === "pending" ? !r.pro.verified : filter === "active" ? r.pro.verified : true,
  );

  const act = async (proId: string, action: "approve" | "reject", name: string) => {
    const res = await setVerification.mutateAsync({ proId, action });
    if (res.ok) {
      toast(action === "approve" ? `${name} is now verified` : `${name}'s application was rejected`, {
        description: action === "approve" ? "Their verified badge is live." : "Profile removed; the account reverts to customer.",
      });
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl">Professionals</h1>
      <div className="mt-2 flex gap-2 text-xs">
        {([["pending","Pending"],["active","Active"],["all","All"]] as const).map(([key, label])=>(
          <button key={key} onClick={()=>setFilter(key)} className={`px-3 py-1.5 rounded-full ${filter===key?"bg-ink text-white":"bg-background border border-border"}`}>{label}</button>
        ))}
      </div>
      <div className="mt-5 rounded-2xl bg-background border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-xs uppercase tracking-widest text-muted-foreground"><tr>
            <th className="text-left p-3">Professional</th><th className="text-left p-3">License</th><th className="text-left p-3">Status</th><th className="text-left p-3">Contact</th><th></th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>
            )}
            {rows.map(({ pro, email })=>(
              <tr key={pro.id}>
                <td className="p-3">
                  <div className="font-medium">{pro.name}</div>
                  <div className="text-[11px] text-muted-foreground">{pro.craft} · {pro.city}</div>
                </td>
                <td className="p-3 font-mono text-[11px]">{pro.certifications[0] ?? "—"}</td>
                <td className="p-3">
                  {pro.verified
                    ? <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-[10px] uppercase tracking-widest">Active</span>
                    : <span className="px-2 py-1 rounded-full bg-gold/20 text-[10px] uppercase tracking-widest">License verify</span>}
                </td>
                <td className="p-3 text-muted-foreground text-[11px]">{email ?? "—"}</td>
                <td className="p-3 text-right">
                  {!pro.verified && (
                    <>
                      <button
                        onClick={() => act(pro.id, "approve", pro.name)}
                        disabled={setVerification.isPending}
                        aria-label={`Approve ${pro.name}`}
                        className="h-8 w-8 rounded-full bg-ink text-white inline-grid place-items-center mr-1 disabled:opacity-40"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => act(pro.id, "reject", pro.name)}
                        disabled={setVerification.isPending}
                        aria-label={`Reject ${pro.name}`}
                        className="h-8 w-8 rounded-full border border-border inline-grid place-items-center disabled:opacity-40"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {!isLoading && rows.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">Nothing in this queue.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersTab() {
  const rows = Array.from({length:8}).map((_,i)=>({n:["Maya R.","James T.","Eli C.","Priya S.","Devon H.","Kira P.","Ren A.","Owen B."][i], e:"user@boujeebook.app", s:[12,4,18,2,7,22,3,9][i], lv:["Elite","Free","Elite","Free","Free","Elite","Free","Elite"][i]}));
  return (
    <div>
      <h1 className="font-display text-3xl">Users</h1>
      <div className="mt-5 rounded-2xl bg-background border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-xs uppercase tracking-widest text-muted-foreground"><tr>
            <th className="text-left p-3">Customer</th><th className="text-left p-3">Email</th><th className="text-left p-3">Bookings</th><th className="text-left p-3">Plan</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {rows.map((r,i)=>(<tr key={i}>
              <td className="p-3 font-medium">{r.n}</td>
              <td className="p-3 text-muted-foreground">{r.e}</td>
              <td className="p-3">{r.s}</td>
              <td className="p-3">{r.lv==="Elite"?<span className="px-2 py-0.5 rounded-full bg-gold/20 text-[10px] uppercase tracking-widest">Elite</span>:<span className="text-muted-foreground text-xs">Free</span>}</td>
            </tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DisputesTab() {
  return (
    <div>
      <h1 className="font-display text-3xl">Disputes</h1>
      <div className="mt-5 space-y-3">
        {DISPUTES.map(d=>(
          <div key={d.id} className="rounded-2xl bg-background border border-border p-5 flex items-start gap-4">
            <div className={`mt-1 h-8 w-8 rounded-full grid place-items-center ${d.priority==="Critical"?"bg-destructive text-white":d.priority==="High"?"bg-gold text-ink":"bg-cream"}`}><AlertTriangle className="h-4 w-4" /></div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">{d.booking}</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{d.priority} priority</span>
              </div>
              <div className="font-display text-lg mt-1">{d.reason}</div>
              <div className="text-xs text-muted-foreground mt-1">{d.customer} vs {d.pro} · ${d.amount} · {d.opened}</div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => toast("Refunds activate with Stripe", { description: "This queue is demo data until payments are connected." })} className="px-3 py-1.5 rounded-full bg-ink text-white text-xs">Refund</button>
              <button onClick={() => toast("Case tooling is demo data", { description: "Real disputes flow in once the in-app dispute form is persisted." })} className="px-3 py-1.5 rounded-full border border-border text-xs">Investigate</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingsTab() {
  const [statusFilter, setStatusFilter] = useState("All");
  const rows = [
    { id:"BK-92841", c:"K. Patel", p:"M. Vega", s:"Skin Fade + Beard", when:"Today 4:30 PM", amt:110, st:"Confirmed" },
    { id:"BK-92842", c:"R. Nguyen", p:"S. Tanaka", s:"Gel-X Full Set", when:"Today 5:00 PM", amt:95, st:"En route" },
    { id:"BK-92840", c:"J. Adler", p:"L. Okafor", s:"Soft Glam", when:"Today 6:15 PM", amt:220, st:"Confirmed" },
    { id:"BK-92839", c:"M. Cole", p:"A. Cole", s:"Balayage", when:"Tomorrow 10:00 AM", amt:360, st:"Confirmed" },
    { id:"BK-92833", c:"T. Reyes", p:"N. Bennett", s:"90 min Sports", when:"Yesterday", amt:230, st:"Completed" },
    { id:"BK-92829", c:"D. Park", p:"R. Fernandez", s:"Volume Set", when:"Jun 22", amt:260, st:"Completed" },
  ];
  return (
    <div>
      <h1 className="font-display text-3xl">Bookings</h1>
      <div className="mt-2 flex gap-2 text-xs">
        {["All","Confirmed","En route","Completed"].map((t)=>(<button key={t} onClick={()=>setStatusFilter(t)} className={`px-3 py-1.5 rounded-full ${statusFilter===t?"bg-ink text-white":"bg-background border border-border"}`}>{t}</button>))}
      </div>
      <div className="mt-5 rounded-2xl bg-background border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-xs uppercase tracking-widest text-muted-foreground"><tr>
            <th className="text-left p-3">Booking</th><th className="text-left p-3">Customer</th><th className="text-left p-3">Pro</th><th className="text-left p-3">Service</th><th className="text-left p-3">When</th><th className="text-left p-3">Amount</th><th className="text-left p-3">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {rows.filter(r => statusFilter === "All" || r.st === statusFilter).map(r => (
              <tr key={r.id}>
                <td className="p-3 font-mono text-[11px]">{r.id}</td>
                <td className="p-3">{r.c}</td>
                <td className="p-3">{r.p}</td>
                <td className="p-3 text-muted-foreground">{r.s}</td>
                <td className="p-3 text-muted-foreground">{r.when}</td>
                <td className="p-3 font-medium">${r.amt}</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-cream text-[10px] uppercase tracking-widest">{r.st}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentsTab() {
  const rows = [
    { d:"Jun 24", type:"Subscription", desc:"Elite customer — Maya R.", amt:29.99, st:"Captured" },
    { d:"Jun 24", type:"Subscription", desc:"Elite pro — Marcus V.", amt:29.99, st:"Captured" },
    { d:"Jun 24", type:"Payout", desc:"M. Vega → •••• 4421", amt:-1820, st:"Sent" },
    { d:"Jun 23", type:"Subscription", desc:"Basic pro — Theo M.", amt:9.99, st:"Captured" },
    { d:"Jun 23", type:"Refund", desc:"BK-91984 · L. Okafor", amt:-110, st:"Refunded" },
    { d:"Jun 23", type:"Subscription", desc:"Basic customer — Eli C.", amt:9.99, st:"Captured" },
  ];
  return (
    <div>
      <h1 className="font-display text-3xl">Payments</h1>
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[["MRR","$184K","+18.4%"],["Subs (today)","412","+22"],["Payouts (today)","$84K","-"],["Refunds (7d)","$1.2K","-"]].map(([l,v,d])=>(
          <div key={l} className="rounded-2xl bg-background border border-border p-5"><div className="text-[10px] uppercase tracking-widest text-muted-foreground">{l}</div><div className="font-display text-3xl mt-1">{v}</div><div className="text-[11px] text-gold mt-1">{d}</div></div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl bg-background border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-xs uppercase tracking-widest text-muted-foreground"><tr>
            <th className="text-left p-3">Date</th><th className="text-left p-3">Type</th><th className="text-left p-3">Description</th><th className="text-left p-3">Amount</th><th className="text-left p-3">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {rows.map((r,i)=>(
              <tr key={i}>
                <td className="p-3 text-muted-foreground">{r.d}</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-cream text-[10px] uppercase tracking-widest">{r.type}</span></td>
                <td className="p-3">{r.desc}</td>
                <td className={`p-3 font-medium ${r.amt<0?"text-destructive":""}`}>${Math.abs(r.amt).toFixed(2)}</td>
                <td className="p-3 text-muted-foreground">{r.st}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsTab() {
  const groups = [
    { t:"Platform", rows:[["Customer Basic","$9.99/mo"],["Customer Elite","$29.99/mo"],["Pro Basic","$9.99/mo"],["Pro Elite","$29.99/mo"]] },
    { t:"Policies", rows:[["Cancellation window","24 hours"],["Late cancel fee","$10"],["Pro daily limit (Basic)","5 bookings"],["Pro daily limit (Elite)","10 bookings"]] },
    { t:"Trust", rows:[["License verification","Required"],["Government ID","Required"],["Background check","Required for mobile"],["Sanitation pledge","Required"]] },
  ];
  return (
    <div>
      <h1 className="font-display text-3xl">Settings</h1>
      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        {groups.map(g=>(
          <div key={g.t} className="rounded-2xl bg-background border border-border p-5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{g.t}</div>
            <div className="mt-3 divide-y divide-border">
              {g.rows.map(([l,v])=>(
                <div key={l} className="py-2.5 flex justify-between text-sm"><span className="text-muted-foreground">{l}</span><span className="font-medium">{v}</span></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
