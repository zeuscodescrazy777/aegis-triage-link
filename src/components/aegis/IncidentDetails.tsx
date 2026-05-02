import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Incident } from "./types";
import { SeverityTag } from "./SeverityTag";
import { Phone, MapPin, Clock, Hash, Send } from "lucide-react";

interface Props {
  incident: Incident | null;
}

function DataField({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="border-2 border-foreground bg-card">
      <div className="flex items-center gap-1.5 border-b-2 border-foreground bg-muted px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest">
        {icon}
        {label}
      </div>
      <div className="font-mono-data px-2 py-1.5 text-sm font-bold">{value}</div>
    </div>
  );
}

export function IncidentDetails({ incident }: Props) {
  const [dispatching, setDispatching] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  if (!incident) {
    return (
      <section className="flex h-full items-center justify-center border-2 border-foreground bg-card">
        <div className="text-center font-mono-data text-xs uppercase text-muted-foreground">
          ◇ Select an incident from the feed ◇
        </div>
      </section>
    );
  }

  async function authorizeDispatch() {
    if (!incident) return;
    setDispatching(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incident }),
      });
      const data: { ok?: boolean; error?: string } = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      await supabase
        .from("incidents")
        .update({ status: "DISPATCHED" })
        .eq("id", incident.id);
      setFeedback({ kind: "ok", text: "DISPATCH AUTHORIZED — UNITS NOTIFIED" });
    } catch (e) {
      setFeedback({ kind: "err", text: `DISPATCH FAILED: ${(e as Error).message}` });
    } finally {
      setDispatching(false);
    }
  }

  const dispatched = incident.status === "DISPATCHED";

  return (
    <section className="flex h-full flex-col border-2 border-foreground bg-card">
      <div className="flex items-center justify-between border-b-2 border-foreground bg-gov-navy px-3 py-2 text-gov-navy-foreground">
        <h2 className="text-xs font-extrabold uppercase tracking-widest">Incident Details</h2>
        <SeverityTag severity={incident.severity} size="md" />
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="border-2 border-foreground bg-muted">
          <div className="border-b-2 border-foreground bg-foreground px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest text-background">
            Summary
          </div>
          <p className="px-3 py-2 text-sm font-bold uppercase leading-snug">{incident.summary}</p>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <DataField
            label="Caller"
            icon={<Phone className="h-3 w-3" strokeWidth={2.5} />}
            value={incident.caller_number}
          />
          <DataField
            label="Status"
            icon={<Send className="h-3 w-3" strokeWidth={2.5} />}
            value={
              <span className={dispatched ? "text-sev-green" : "text-sev-amber"}>
                {incident.status}
              </span>
            }
          />
          <DataField
            label="Location"
            icon={<MapPin className="h-3 w-3" strokeWidth={2.5} />}
            value={incident.location_text}
          />
          <DataField
            label="Coordinates"
            icon={<Hash className="h-3 w-3" strokeWidth={2.5} />}
            value={`${incident.lat.toFixed(4)}, ${incident.lon.toFixed(4)}`}
          />
          <DataField
            label="Reported"
            icon={<Clock className="h-3 w-3" strokeWidth={2.5} />}
            value={new Date(incident.created_at).toUTCString().replace(" GMT", " UTC")}
          />
          <DataField
            label="Incident ID"
            icon={<Hash className="h-3 w-3" strokeWidth={2.5} />}
            value={<span className="text-xs">{incident.id.slice(0, 8).toUpperCase()}</span>}
          />
        </div>

        {feedback && (
          <div
            className={`mt-3 border-2 border-foreground px-3 py-2 text-xs font-extrabold uppercase tracking-wider ${
              feedback.kind === "ok"
                ? "bg-sev-green text-sev-foreground"
                : "bg-sev-red text-sev-foreground"
            }`}
          >
            {feedback.text}
          </div>
        )}
      </div>

      <div className="border-t-[3px] border-foreground p-2">
        <button
          onClick={authorizeDispatch}
          disabled={dispatching || dispatched}
          className="w-full border-2 border-foreground bg-sev-red px-4 py-4 text-base font-extrabold uppercase tracking-[0.18em] text-sev-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          {dispatched
            ? "✓ DISPATCH AUTHORIZED"
            : dispatching
              ? "TRANSMITTING…"
              : "▶ AUTHORIZE DISPATCH"}
        </button>
      </div>
    </section>
  );
}
