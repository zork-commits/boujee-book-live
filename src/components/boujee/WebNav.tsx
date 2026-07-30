import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { to: "/services", label: "Services" },
  { to: "/professionals", label: "Professionals" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function WebNav({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const tx = dark ? "text-white" : "text-ink";
  return (
    <header className={`absolute top-0 inset-x-0 z-40 ${tx}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-10 flex items-center justify-between py-6">
        <Link to="/" className="font-display text-2xl tracking-[0.25em]">BOUJEE BOOK<sup className="text-[10px] tracking-normal opacity-60">™</sup></Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          {LINKS.map(l => (
            <Link key={l.to} to={l.to} className="opacity-80 hover:opacity-100 transition-opacity">{l.label}</Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link to="/app" className={`text-sm px-4 py-2 rounded-full border ${dark ? "border-white/30" : "border-ink/20"} hover:bg-current/5`}>Open App</Link>
          <Link to="/professionals" className="text-sm px-4 py-2 rounded-full bg-gold text-ink font-medium">Become a Pro</Link>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className={`md:hidden absolute inset-x-0 top-full ${dark ? "bg-ink" : "bg-background"} border-t border-current/10 px-6 py-6 flex flex-col gap-4`}>
          {LINKS.map(l => (
            <Link key={l.to} to={l.to} className="text-base" onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
          <Link to="/app" className="mt-2 text-center px-4 py-3 rounded-full border border-current/20">Open App</Link>
          <Link to="/professionals" className="text-center px-4 py-3 rounded-full bg-gold text-ink font-medium">Become a Pro</Link>
        </div>
      )}
    </header>
  );
}
