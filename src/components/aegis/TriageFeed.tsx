import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sortIncidents, type Incident } from "./types";
import { SeverityTag } from "./SeverityTag";
import { Activity } from "lucide-react";

interface Props {
  selectedId: string | null;
  onSelect: (incident: Incident) => void;
}

function formatRelative(iso: string, now: number | null) {
  if (now === null) return "—";
  const diff = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s`;
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  return `${h}h ${m}m`;
}

export function TriageFeed({ selectedId, onSelect }: Props) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (cancelled) return;
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      const list = sortIncidents((data ?? []) as Incident[]);
      setIncidents(list);
      setLoading(false);
      if (list.length && !selectedId) onSelect(list[0]);
    }
    load();

    const channel = supabase
      .channel("incidents-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents" },
        (payload) => {
          setIncidents((prev) => {
            let next = prev;
            if (payload.eventType === "INSERT") {
              next = [payload.new as Incident, ...prev.filter((i) => i.id !== (payload.new as Incident).id)];
            } else if (payload.eventType === "UPDATE") {
              next = prev.map((i) => (i.id === (payload.new as Incident).id ? (payload.new as Incident) : i));
            } else if (payload.eventType === "DELETE") {
              next = prev.filter((i) => i.id !== (payload.old as Incident).id);
            }
            return sortIncidents(next);
          });
        }
      )
      .subscribe();

    setTick(Date.now());
    const clockId = setInterval(() => setTick(Date.now()), 1000);

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      clearInterval(clockId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = {
    RED: incidents.filter((i) => i.severity === "RED").length,
    AMBER: incidents.filter((i) => i.severity === "AMBER").length,
    GREEN: incidents.filter((i) => i.severity === "GREEN").length,
  };

  return (
    <section
      className="flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card/70 backdrop-blur-md"
      style={{ boxShadow: "var(--shadow-elevate)" }}
    >
      <div className="border-b border-border/60 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Live Triage Feed
            </h2>
          </div>
          <div className="flex items-center gap-1.5 font-mono-data text-[11px] font-semibold">
            <span className="rounded-full bg-sev-red/15 px-2 py-0.5 text-sev-red ring-1 ring-sev-red/40">
              R {counts.RED}
            </span>
            <span className="rounded-full bg-sev-amber/15 px-2 py-0.5 text-sev-amber ring-1 ring-sev-amber/40">
              A {counts.AMBER}
            </span>
            <span className="rounded-full bg-sev-green/15 px-2 py-0.5 text-sev-green ring-1 ring-sev-green/40">
              G {counts.GREEN}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[80px_1fr_70px] gap-2 border-b border-border/60 bg-surface-1/40 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <span>Severity</span>
        <span>Summary / Location</span>
        <span className="text-right">Age</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && <div className="p-4 font-mono-data text-xs text-muted-foreground">Loading feed…</div>}
        {error && (
          <div className="m-3 rounded-lg border border-sev-red/40 bg-sev-red/10 p-3 text-xs font-medium text-sev-red">
            ERR: {error}
          </div>
        )}
        {!loading && incidents.length === 0 && (
          <div className="p-4 font-mono-data text-xs uppercase text-muted-foreground">
            No active incidents.
          </div>
        )}
        <ul>
          {incidents.map((inc) => {
            const active = inc.id === selectedId;
            return (
              <li
                key={inc.id}
                onClick={() => onSelect(inc)}
                className={`relative grid cursor-pointer grid-cols-[80px_1fr_70px] gap-2 border-b border-border/40 px-4 py-3 transition-colors ${
                  active
                    ? "bg-primary/10"
                    : "hover:bg-surface-1/60"
                }`}
              >
                {active && (
                  <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary" />
                )}
                <div className="flex items-center">
                  <SeverityTag severity={inc.severity} size="sm" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {inc.summary}
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {inc.location_text}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono-data text-xs font-semibold text-foreground">
                    {formatRelative(inc.created_at, tick)}
                  </div>
                  <div
                    className={`mt-0.5 font-mono-data text-[10px] font-semibold uppercase tracking-wider ${
                      inc.status === "DISPATCHED" ? "text-sev-green" : "text-sev-amber"
                    }`}
                  >
                    {inc.status}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
