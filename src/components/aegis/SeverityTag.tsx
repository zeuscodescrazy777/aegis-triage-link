import type { Severity } from "./types";

const styles: Record<Severity, string> = {
  RED: "bg-sev-red/15 text-sev-red ring-1 ring-sev-red/40",
  AMBER: "bg-sev-amber/15 text-sev-amber ring-1 ring-sev-amber/40",
  GREEN: "bg-sev-green/15 text-sev-green ring-1 ring-sev-green/40",
};

const dot: Record<Severity, string> = {
  RED: "bg-sev-red",
  AMBER: "bg-sev-amber",
  GREEN: "bg-sev-green",
};

export function SeverityTag({ severity, size = "md" }: { severity: Severity; size?: "sm" | "md" | "lg" }) {
  const padding =
    size === "lg"
      ? "px-3 py-1 text-xs gap-2"
      : size === "sm"
        ? "px-2 py-0.5 text-[10px] gap-1.5"
        : "px-2.5 py-0.5 text-[11px] gap-1.5";
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold uppercase tracking-wider ${styles[severity]} ${padding}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot[severity]}`} />
      {severity}
    </span>
  );
}
