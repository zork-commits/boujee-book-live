import { Link, useLocation } from "@tanstack/react-router";
import { LayoutGrid, CalendarDays, Users, Wallet, Scissors } from "lucide-react";

const TABS = [
  { to: "/pro", label: "Today", icon: LayoutGrid, exact: true },
  { to: "/pro/schedule", label: "Schedule", icon: CalendarDays },
  { to: "/pro/clients", label: "Clients", icon: Users },
  { to: "/pro/earnings", label: "Earnings", icon: Wallet },
  { to: "/pro/profile", label: "Studio", icon: Scissors },
];

export function ProTabs() {
  const pathname = useLocation({ select: (l) => l.pathname });
  return (
    <nav className="sticky bottom-0 z-30 mt-auto border-t border-white/10 bg-ink/95 backdrop-blur-xl">
      <div className="grid grid-cols-5 px-1 pt-2 pb-3">
        {TABS.map((t) => {
          const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
          const Icon = t.icon;
          return (
            <Link key={t.to} to={t.to} className="flex flex-col items-center gap-1 py-1">
              <Icon className={`h-5 w-5 ${active ? "text-gold" : "text-white/50"}`} />
              <span className={`text-[10px] tracking-wide ${active ? "text-white" : "text-white/50"}`}>{t.label}</span>
              {active && <span className="h-1 w-1 -mt-0.5 rounded-full bg-gold" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
