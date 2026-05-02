import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/aegis/Navbar";
import { TriageFeed } from "@/components/aegis/TriageFeed";
import { IncidentDetails } from "@/components/aegis/IncidentDetails";
import { LiveMap } from "@/components/aegis/LiveMap";
import type { Incident } from "@/components/aegis/types";

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
    <div className="flex h-screen flex-col bg-background">
      <Navbar />

      {/* Status strip */}
      <div className="flex items-stretch border-b-2 border-foreground bg-foreground text-background">
        <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest">
          ◉ LIVE
        </div>
        <div className="border-l-2 border-background px-3 py-1 font-mono-data text-[10px] font-bold uppercase">
          CHANNEL: PUBLIC.INCIDENTS
        </div>
        <div className="border-l-2 border-background px-3 py-1 font-mono-data text-[10px] font-bold uppercase">
          PROTOCOL: AEGIS-112 / v1.0
        </div>
        <div className="ml-auto border-l-2 border-background px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest">
          CLASSIFICATION: OFFICIAL USE
        </div>
      </div>

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden p-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Left: feed */}
        <div className="min-h-0">
          <TriageFeed
            selectedId={selected?.id ?? null}
            onSelect={(i) => setSelected(i)}
          />
        </div>

        {/* Right: details + map stacked */}
        <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
          <IncidentDetails incident={selected} />
          <LiveMap incident={selected} />
        </div>
      </main>

      <footer className="border-t-[3px] border-foreground bg-gov-navy px-3 py-1 text-gov-navy-foreground">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
          <span>Aegis-112 — Department of Public Safety</span>
          <span className="font-mono-data">UNCLASSIFIED // FOR OFFICIAL USE ONLY</span>
        </div>
      </footer>
    </div>
  );
}
