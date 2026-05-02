import { lazy, Suspense, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/aegis/Navbar";
import { TriageFeed } from "@/components/aegis/TriageFeed";
import { IncidentDetails } from "@/components/aegis/IncidentDetails";
import type { Incident } from "@/components/aegis/types";

const LiveMap = lazy(() =>
  import("@/components/aegis/LiveMap").then((m) => ({ default: m.LiveMap })),
);

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Aegis-112 — Emergency Triage Dashboard" },
      {
        name: "description",
        content:
          "Aegis-112 official emergency triage portal. Real-time incident feed with geo-positioning and dispatch authorization.",
      },
    ],
  }),
});

function Dashboard() {
  const [selected, setSelected] = useState<Incident | null>(null);

  return (
    <div className="flex h-screen flex-col">
      <Navbar />

      {/* Status strip */}
      <div className="flex items-stretch border-b border-border/60 bg-surface-1/50 backdrop-blur-md">
        <div className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-sev-green">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sev-green opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-sev-green" />
          </span>
          Live
        </div>
        <div className="border-l border-border/60 px-4 py-1.5 font-mono-data text-[10px] font-medium uppercase text-muted-foreground">
          channel: public.incidents
        </div>
        <div className="border-l border-border/60 px-4 py-1.5 font-mono-data text-[10px] font-medium uppercase text-muted-foreground">
          protocol: aegis‑112 / v1.0
        </div>
        <div className="ml-auto border-l border-border/60 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          Classification · Official Use
        </div>
      </div>

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden p-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Left: feed */}
        <div className="min-h-0">
          <TriageFeed
            selectedId={selected?.id ?? null}
            onSelect={(i) => setSelected(i)}
          />
        </div>

        {/* Right: details + map stacked */}
        <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
          <IncidentDetails incident={selected} />
          <Suspense
            fallback={
              <div className="flex items-center justify-center rounded-xl border border-border/60 bg-card/70 font-mono-data text-xs uppercase text-muted-foreground">
                Loading map…
              </div>
            }
          >
            <LiveMap incident={selected} />
          </Suspense>
        </div>
      </main>

      <footer className="border-t border-border/60 bg-surface-1/40 px-4 py-2 backdrop-blur-md">
        <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <span>Aegis‑112 · Department of Public Safety</span>
          <span className="font-mono-data">Unclassified // For Official Use Only</span>
        </div>
      </footer>
    </div>
  );
}
