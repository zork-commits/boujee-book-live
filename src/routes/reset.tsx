import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/boujee/AppShell";
import { useRequestPasswordReset, useResetPassword } from "@/lib/api";
import { Loader2, MailCheck, KeyRound } from "lucide-react";

export const Route = createFileRoute("/reset")({
  head: () => ({ meta: [{ title: "Reset password — Boujee Book" }] }),
  validateSearch: (s: Record<string, unknown>): { token?: string } => ({
    token: typeof s.token === "string" ? s.token : undefined,
  }),
  component: Reset,
});

function Reset() {
  const { token } = Route.useSearch();
  return (
    <AppShell dark>
      <div className="min-h-[inherit] flex flex-col justify-center bg-ink text-white px-6 py-16">
        <div className="text-[10px] tracking-[0.4em] text-gold uppercase">Boujee Book</div>
        {token ? <SetNewPassword token={token} /> : <RequestReset />}
        <Link to="/auth" className="mt-8 text-xs text-white/50 underline underline-offset-4">Back to sign in</Link>
      </div>
    </AppShell>
  );
}

function RequestReset() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const request = useRequestPasswordReset();

  if (sent) {
    return (
      <div className="mt-6">
        <MailCheck className="h-8 w-8 text-gold" />
        <h1 className="font-display text-3xl mt-4">Check your email</h1>
        <p className="mt-3 text-sm text-white/60 max-w-[300px]">
          If an account exists for {email}, a reset link is on its way. It expires in 15 minutes.
        </p>
      </div>
    );
  }

  return (
    <form
      className="mt-6"
      onSubmit={async (e) => {
        e.preventDefault();
        await request.mutateAsync(email);
        setSent(true);
      }}
    >
      <h1 className="font-display text-3xl">Forgot your password?</h1>
      <p className="mt-2 text-sm text-white/60">We'll email you a reset link.</p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="mt-5 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm outline-none focus:border-gold/60 placeholder:text-white/40"
      />
      <button
        type="submit"
        disabled={request.isPending}
        className="mt-4 w-full h-12 rounded-full bg-gold text-ink font-medium text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {request.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Send reset link
      </button>
    </form>
  );
}

function SetNewPassword({ token }: { token: string }) {
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const reset = useResetPassword();

  return (
    <form
      className="mt-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        const res = await reset.mutateAsync({ token, password });
        if (!res.ok) { setError(res.error); return; }
        nav({ to: "/auth" });
      }}
    >
      <KeyRound className="h-8 w-8 text-gold" />
      <h1 className="font-display text-3xl mt-4">Set a new password</h1>
      <p className="mt-2 text-sm text-white/60">This signs you out on every device.</p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password (8+ characters)"
        required
        minLength={8}
        autoComplete="new-password"
        className="mt-5 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm outline-none focus:border-gold/60 placeholder:text-white/40"
      />
      {error && <div className="mt-3 text-xs text-red-400">{error}</div>}
      <button
        type="submit"
        disabled={reset.isPending}
        className="mt-4 w-full h-12 rounded-full bg-gold text-ink font-medium text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {reset.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Save new password
      </button>
    </form>
  );
}
