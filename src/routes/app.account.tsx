import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/boujee/AppShell";
import { AppTabs } from "@/components/boujee/AppTabs";
import { useExportMyData, useDeleteMyAccount, useUpdateMyName, useSignOutEverywhere, useLogout } from "@/lib/api";
import { ChevronLeft, Download, Trash2, LogOut, Check, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/account")({
  head: () => ({ meta: [{ title: "Account settings — Boujee Book" }] }),
  component: Account,
});

function Account() {
  const { user } = Route.useRouteContext();
  const nav = useNavigate();
  const [name, setName] = useState(user.name);
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const exportData = useExportMyData();
  const deleteAccount = useDeleteMyAccount();
  const updateName = useUpdateMyName();
  const signOutEverywhere = useSignOutEverywhere();
  const logout = useLogout();

  const download = async () => {
    const data = await exportData.mutateAsync();
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "boujee-book-my-data.json" });
    a.click();
    URL.revokeObjectURL(url);
    toast("Your data is downloading", { description: "Everything we hold about you, as JSON." });
  };

  const destroy = async () => {
    setError(null);
    const res = await deleteAccount.mutateAsync(password);
    if (!res.ok) { setError(res.error); return; }
    nav({ to: "/" });
    toast("Your account has been deleted", { description: "Personal data erased. Take care." });
  };

  return (
    <AppShell>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link to="/app/me" className="h-9 w-9 grid place-items-center rounded-full border border-border"><ChevronLeft className="h-4 w-4" /></Link>
        <h1 className="font-display text-2xl">Account settings</h1>
      </header>

      <section className="px-5 mt-4">
        <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Display name</label>
        <div className="mt-1 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-3 py-3 rounded-xl bg-cream border border-border text-sm outline-none focus:border-gold"
          />
          <button
            onClick={async () => { await updateName.mutateAsync(name.trim()); toast("Name updated"); }}
            disabled={updateName.isPending || !name.trim() || name.trim() === user.name}
            className="px-4 rounded-xl bg-ink text-white text-sm disabled:opacity-40 inline-flex items-center gap-1.5"
          >
            {updateName.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}Save
          </button>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground">Signed in as {user.email}</div>
      </section>

      <section className="px-5 mt-8 space-y-2">
        <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground">Privacy & data</h2>
        <button
          onClick={download}
          disabled={exportData.isPending}
          className="w-full flex items-center gap-3 p-4 rounded-2xl border border-border text-left disabled:opacity-50"
        >
          {exportData.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          <div>
            <div className="text-sm">Download my data</div>
            <div className="text-[11px] text-muted-foreground">Profile, bookings, reviews, messages — as JSON</div>
          </div>
        </button>
        <button
          onClick={async () => { await signOutEverywhere.mutateAsync(); nav({ to: "/auth" }); }}
          disabled={signOutEverywhere.isPending}
          className="w-full flex items-center gap-3 p-4 rounded-2xl border border-border text-left disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          <div>
            <div className="text-sm">Sign out everywhere</div>
            <div className="text-[11px] text-muted-foreground">Ends all sessions on every device</div>
          </div>
        </button>
      </section>

      <section className="px-5 mt-8 pb-6">
        <h2 className="text-[10px] uppercase tracking-widest text-destructive">Danger zone</h2>
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="mt-2 w-full flex items-center gap-3 p-4 rounded-2xl border border-destructive/40 text-left"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
            <div>
              <div className="text-sm text-destructive">Delete my account</div>
              <div className="text-[11px] text-muted-foreground">Erases your personal data. This can't be undone.</div>
            </div>
          </button>
        ) : (
          <div className="mt-2 rounded-2xl border border-destructive/40 p-4">
            <div className="flex items-center gap-2 text-sm text-destructive"><ShieldAlert className="h-4 w-4" />Confirm deletion</div>
            <p className="mt-2 text-xs text-muted-foreground">
              Your profile, favorites, and messages are erased{user.proId ? ", and your pro studio is removed from the marketplace" : ""}.
              Booking history is anonymized. Enter your password to continue.
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="mt-3 w-full px-3 py-3 rounded-xl bg-cream border border-border text-sm outline-none"
            />
            {error && <div className="mt-2 text-xs text-destructive">{error}</div>}
            <div className="mt-3 flex gap-2 justify-end">
              <button onClick={() => { setConfirming(false); setPassword(""); setError(null); }} className="px-4 py-2 rounded-full border border-border text-xs">Keep my account</button>
              <button
                onClick={destroy}
                disabled={deleteAccount.isPending || !password}
                className="px-4 py-2 rounded-full bg-destructive text-white text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleteAccount.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                Delete forever
              </button>
            </div>
          </div>
        )}
      </section>

      <div className="px-5 pb-4">
        <button
          onClick={async () => { await logout.mutateAsync(); nav({ to: "/" }); }}
          className="w-full py-3 rounded-2xl border border-border text-sm text-muted-foreground"
        >
          Sign out on this device
        </button>
      </div>
      <AppTabs />
    </AppShell>
  );
}
