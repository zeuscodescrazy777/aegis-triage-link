import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sortIncidents, type Incident } from "./types";
import { SeverityTag } from "./SeverityTag";

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
    <section className="flex h-full flex-col border-2 border-foreground bg-card">
      <div className="border-b-2 border-foreground bg-gov-navy px-3 py-2 text-gov-navy-foreground">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-widest">
            Live Triage Feed
          </h2>
          <div className="flex items-center gap-1.5 font-mono-data text-[11px] font-bold">
            <span className="border-2 border-foreground bg-sev-red px-1.5 py-0.5 text-sev-foreground">
              R {counts.RED}
            </span>
            <span className="border-2 border-foreground bg-sev-amber px-1.5 py-0.5 text-foreground">
              A {counts.AMBER}
            </span>
            <span className="border-2 border-foreground bg-sev-green px-1.5 py-0.5 text-sev-foreground">
              G {counts.GREEN}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[60px_1fr_70px] gap-2 border-b-2 border-foreground bg-muted px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
        <span>SEV</span>
        <span>Summary / Location</span>
        <span className="text-right">Age</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && <div className="p-4 font-mono-data text-xs">LOADING FEED…</div>}
        {error && (
          <div className="m-2 border-2 border-foreground bg-sev-red p-2 text-xs font-bold text-sev-foreground">
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
                className={`grid cursor-pointer grid-cols-[60px_1fr_70px] gap-2 border-b-2 border-foreground px-3 py-2 ${
                  active ? "bg-gov-navy text-gov-navy-foreground" : "bg-card hover:bg-accent"
                }`}
              >
                <div>
                  <SeverityTag severity={inc.severity} size="sm" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-bold uppercase">{inc.summary}</div>
                  <div className={`truncate text-[11px] ${active ? "opacity-80" : "text-muted-foreground"}`}>
                    {inc.location_text}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono-data text-xs font-bold">{formatRelative(inc.created_at, tick)}</div>
                  <div
                    className={`mt-0.5 font-mono-data text-[10px] font-bold uppercase ${
                      inc.status === "DISPATCHED"
                        ? active
                          ? "text-sev-green"
                          : "text-sev-green"
                        : active
                          ? "opacity-80"
                          : "text-muted-foreground"
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
