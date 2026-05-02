import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

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
    <header className="border-b-[3px] border-foreground bg-gov-navy text-gov-navy-foreground">
      <div className="flex items-stretch justify-between">
        <div className="flex items-center gap-3 border-r-[3px] border-foreground bg-gov-navy px-4 py-3">
          <ShieldAlert className="h-7 w-7" strokeWidth={2.5} aria-hidden />
          <div className="leading-tight">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
              Department of Public Safety
            </div>
            <h1 className="text-base font-extrabold uppercase tracking-wider sm:text-lg">
              Official Emergency Triage Portal — Aegis-112
            </h1>
          </div>
        </div>

        <div className="flex items-stretch">
          <div className="hidden flex-col justify-center border-l-[3px] border-foreground px-4 py-2 text-right md:flex">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
              Operator
            </span>
            <span className="text-sm font-bold uppercase">DISPATCH-01</span>
          </div>
          <div className="flex flex-col justify-center border-l-[3px] border-foreground px-5 py-2 text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
              System Time
            </span>
            <span className="font-mono-data text-2xl font-bold leading-none">
              {now ? formatTime(now) : "00:00:00"}
            </span>
            <span className="font-mono-data mt-0.5 text-[10px] opacity-80">
              {now ? formatDate(now) : ""}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
