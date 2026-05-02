import type { Severity } from "./types";

const styles: Record<Severity, string> = {
  RED: "bg-sev-red text-sev-foreground",
  AMBER: "bg-sev-amber text-foreground",
  GREEN: "bg-sev-green text-sev-foreground",
};

export function SeverityTag({ severity, size = "md" }: { severity: Severity; size?: "sm" | "md" | "lg" }) {
  const padding = size === "lg" ? "px-3 py-1.5 text-sm" : size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center border-2 border-foreground font-extrabold uppercase tracking-widest ${styles[severity]} ${padding}`}
    >
      {severity}
    </span>
  );
}
