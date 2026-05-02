import { useEffect, useState } from "react";
import { ShieldAlert, Radio } from "lucide-react";

function formatTime(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatDate(d: Date) {
  return d.toUTCString().replace(" GMT", " UTC");
}

export function Navbar() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      className="border-b border-border/60 backdrop-blur-md"
      style={{ background: "var(--gradient-header)" }}
    >
      <div className="flex items-stretch justify-between">
        <div className="flex items-center gap-3 px-5 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/40">
            <ShieldAlert className="h-5 w-5 text-primary" strokeWidth={2.2} aria-hidden />
          </div>
          <div className="leading-tight">
            <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Department of Public Safety
            </div>
            <h1 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              Aegis-112 · Emergency Triage Console
            </h1>
          </div>
        </div>

        <div className="flex items-stretch">
          <div className="hidden flex-col justify-center px-4 py-2 text-right md:flex">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Operator
            </span>
            <span className="text-sm font-semibold text-foreground">Dispatch‑01</span>
          </div>
          <div className="flex items-center gap-2 border-l border-border/60 px-4 py-2">
            <Radio className="h-3.5 w-3.5 text-sev-green animate-pulse" />
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-sev-green">
              Online
            </span>
          </div>
          <div className="flex flex-col justify-center border-l border-border/60 px-5 py-2 text-right">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              System Time
            </span>
            <span className="font-mono-data text-2xl font-semibold leading-none text-foreground">
              {now ? formatTime(now) : "00:00:00"}
            </span>
            <span className="font-mono-data mt-0.5 text-[10px] text-muted-foreground">
              {now ? formatDate(now) : ""}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
