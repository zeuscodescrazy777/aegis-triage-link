
CREATE TYPE public.incident_severity AS ENUM ('RED', 'AMBER', 'GREEN');
CREATE TYPE public.incident_status AS ENUM ('PENDING', 'DISPATCHED');

CREATE TABLE public.incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  severity public.incident_severity NOT NULL DEFAULT 'GREEN',
  summary TEXT NOT NULL,
  caller_number TEXT NOT NULL,
  location_text TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  status public.incident_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_incidents_severity_created ON public.incidents (severity, created_at DESC);

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read incidents" ON public.incidents FOR SELECT USING (true);
CREATE POLICY "Public insert incidents" ON public.incidents FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update incidents" ON public.incidents FOR UPDATE USING (true);

ALTER TABLE public.incidents REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
