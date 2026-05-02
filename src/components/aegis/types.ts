export type Severity = "RED" | "AMBER" | "GREEN";
export type Status = "PENDING" | "DISPATCHED";

export interface Incident {
  id: string;
  severity: Severity;
  summary: string;
  caller_number: string;
  location_text: string;
  lat: number;
  lon: number;
  status: Status;
  created_at: string;
  updated_at: string;
}

export const SEVERITY_RANK: Record<Severity, number> = {
  RED: 0,
  AMBER: 1,
  GREEN: 2,
};

export function sortIncidents(items: Incident[]): Incident[] {
  return [...items].sort((a, b) => {
    const r = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    if (r !== 0) return r;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
