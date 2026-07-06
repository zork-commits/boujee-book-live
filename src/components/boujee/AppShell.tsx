import type { ReactNode } from "react";

/** App shell. Renders mobile screen full-width on phone, in a phone frame on desktop. */
export function AppShell({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <div className={`min-h-screen ${dark ? "bg-ink" : "bg-cream"} lg:py-8`}>
      <div className="mx-auto lg:max-w-[420px]">
        <div className="lg:rounded-[3rem] lg:border-[10px] lg:border-ink lg:overflow-hidden lg:shadow-luxury relative bg-background">
          <div className={`hidden lg:flex items-center justify-between px-7 pt-3 pb-1 text-[11px] font-medium ${dark ? "text-white bg-ink" : "text-foreground"}`}>
            <span>9:41</span>
            <span className="font-display tracking-[0.3em] text-[10px] opacity-60">BOUJEE BOOK</span>
            <span>●●●●●</span>
          </div>
          {/* flex-col so short pages can push sticky footers (AppTabs/ProTabs) to the bottom via mt-auto */}
          <div className={`${dark ? "bg-ink text-white" : "bg-background"} flex flex-col min-h-screen lg:min-h-[820px] lg:max-h-[820px] lg:overflow-y-auto no-scrollbar`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
