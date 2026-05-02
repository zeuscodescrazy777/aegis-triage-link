import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Incident } from "./types";
import { SeverityTag } from "./SeverityTag";
import { Phone, MapPin, Clock, Hash, Send, FileText } from "lucide-react";

interface Props {
  incident: Incident | null;
}

function DataField({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-surface-1/60 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="font-mono-data mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

export function IncidentDetails({ incident }: Props) {
  const [dispatching, setDispatching] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  if (!incident) {
    return (
      <section
        className="flex h-full items-center justify-center rounded-xl border border-border/60 bg-card/70 backdrop-blur-md"
        style={{ boxShadow: "var(--shadow-elevate)" }}
      >
        <div className="text-center font-mono-data text-xs uppercase tracking-wider text-muted-foreground">
          Select an incident from the feed
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
      setFeedback({ kind: "ok", text: "Dispatch authorized — units notified" });
    } catch (e) {
      setFeedback({ kind: "err", text: `Dispatch failed: ${(e as Error).message}` });
    } finally {
      setDispatching(false);
    }
  }

  const dispatched = incident.status === "DISPATCHED";

  return (
    <section
      className="flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card/70 backdrop-blur-md"
      style={{ boxShadow: "var(--shadow-elevate)" }}
    >
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Incident Details
          </h2>
        </div>
        <SeverityTag severity={incident.severity} size="md" />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
            Summary
          </div>
          <p className="mt-1 text-sm font-semibold leading-snug text-foreground">
            {incident.summary}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <DataField
            label="Caller"
            icon={<Phone className="h-3 w-3" strokeWidth={2.2} />}
            value={incident.caller_number}
          />
          <DataField
            label="Status"
            icon={<Send className="h-3 w-3" strokeWidth={2.2} />}
            value={
              <span className={dispatched ? "text-sev-green" : "text-sev-amber"}>
                {incident.status}
              </span>
            }
          />
          <DataField
            label="Location"
            icon={<MapPin className="h-3 w-3" strokeWidth={2.2} />}
            value={incident.location_text}
          />
          <DataField
            label="Coordinates"
            icon={<Hash className="h-3 w-3" strokeWidth={2.2} />}
            value={`${incident.lat.toFixed(4)}, ${incident.lon.toFixed(4)}`}
          />
          <DataField
            label="Reported"
            icon={<Clock className="h-3 w-3" strokeWidth={2.2} />}
            value={new Date(incident.created_at).toUTCString().replace(" GMT", " UTC")}
          />
          <DataField
            label="Incident ID"
            icon={<Hash className="h-3 w-3" strokeWidth={2.2} />}
            value={<span className="text-xs">{incident.id.slice(0, 8).toUpperCase()}</span>}
          />
        </div>

        {feedback && (
          <div
            className={`mt-3 rounded-lg border px-3 py-2 text-xs font-semibold ${
              feedback.kind === "ok"
                ? "border-sev-green/40 bg-sev-green/10 text-sev-green"
                : "border-sev-red/40 bg-sev-red/10 text-sev-red"
            }`}
          >
            {feedback.text}
          </div>
        )}
      </div>

      <div className="border-t border-border/60 p-3">
        <button
          onClick={authorizeDispatch}
          disabled={dispatching || dispatched}
          className="w-full rounded-lg bg-sev-red px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          style={
            !dispatched && !dispatching
              ? { boxShadow: "0 8px 24px -8px oklch(0.65 0.22 22 / 0.6)" }
              : undefined
          }
        >
          {dispatched
            ? "✓ Dispatch Authorized"
            : dispatching
              ? "Transmitting…"
              : "▶ Authorize Dispatch"}
        </button>
      </div>
    </section>
  );
}
