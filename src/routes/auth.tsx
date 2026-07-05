import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/boujee/AppShell";
import { useLogin, useSignup } from "@/lib/api";
import { Sparkles, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Boujee Book" }] }),
  validateSearch: (s: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  component: Auth,
});

function Auth() {
  const { redirect } = Route.useSearch();
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const login = useLogin();
  const signup = useSignup();
  const busy = login.isPending || signup.isPending;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res =
        mode === "login"
          ? await login.mutateAsync({ email, password })
          : await signup.mutateAsync({ email, password, name });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const target = redirect ?? (res.user.proId ? "/pro" : "/app");
      nav({ href: target, replace: true });
    } catch {
      setError(mode === "login" ? "Could not sign in — check your details." : "Could not create your account.");
    }
  };

  return (
    <AppShell dark>
      <div className="min-h-[inherit] flex flex-col justify-between text-white bg-ink">
        <div className="px-6 pt-16">
          <div className="text-[10px] tracking-[0.4em] text-gold uppercase">Track Them · Book Them · Love Them™</div>
          <h1 className="mt-4 font-display text-5xl leading-[1.02]">
            BOUJEE<br />BOOK<span className="text-gold">.</span>
          </h1>
          <p className="mt-4 text-sm text-white/60 max-w-[260px]">Book trusted beauty and wellness professionals in minutes.</p>
        </div>

        <form onSubmit={submit} className="px-6 pb-10">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-white/5 border border-white/10 mb-5">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null); }}
                className={`py-2 rounded-full text-xs ${mode === m ? "bg-gold text-ink font-medium" : "text-white/60"}`}
              >
                {m === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {mode === "signup" && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                required
                className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm outline-none focus:border-gold/60 placeholder:text-white/40"
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              autoComplete="email"
              className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm outline-none focus:border-gold/60 placeholder:text-white/40"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (8+ characters)"
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm outline-none focus:border-gold/60 placeholder:text-white/40"
            />
          </div>

          {error && <div className="mt-3 text-xs text-red-400">{error}</div>}

          <button
            type="submit"
            disabled={busy}
            className="mt-5 w-full h-12 rounded-full bg-gold text-ink font-medium text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {mode === "login" ? "Sign in" : "Create my account"}
          </button>

          <div className="mt-4 text-center text-[11px] text-white/40">
            Demo: demo@boujeebook.app · Pro: marcus@boujeebook.app · password “boujee123”
          </div>
        </form>
      </div>
    </AppShell>
  );
}
