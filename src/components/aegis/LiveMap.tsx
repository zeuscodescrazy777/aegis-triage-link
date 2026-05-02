import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Incident } from "./types";

// Fix default marker icons (Leaflet relies on relative URLs that break with bundlers).
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const SEV_COLORS: Record<Incident["severity"], string> = {
  RED: "#D91E18",
  AMBER: "#F39C12",
  GREEN: "#27AE60",
};

function makeIcon(severity: Incident["severity"]) {
  const color = SEV_COLORS[severity];
  return L.divIcon({
    className: "",
    html: `<div style="width:22px;height:22px;background:${color};border:3px solid #1A1A1A;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:11px;font-family:ui-monospace,monospace;">${severity[0]}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function Recenter({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], 14, { animate: false });
  }, [lat, lon, map]);
  return null;
}

interface Props {
  incident: Incident | null;
}

export function LiveMap({ incident }: Props) {
  const initialRef = useRef<[number, number]>([40.7589, -73.9851]);

  return (
    <section className="flex h-full flex-col border-2 border-foreground bg-card">
      <div className="border-b-2 border-foreground bg-gov-navy px-3 py-2 text-gov-navy-foreground">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-widest">Geo Position</h2>
          <span className="font-mono-data text-[11px] font-bold">
            {incident
              ? `LAT ${incident.lat.toFixed(4)} / LON ${incident.lon.toFixed(4)}`
              : "AWAITING SELECTION"}
          </span>
        </div>
      </div>
      <div className="relative flex-1">
        <MapContainer
          center={initialRef.current}
          zoom={13}
          scrollWheelZoom
          className="absolute inset-0"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {incident && (
            <>
              <Recenter lat={incident.lat} lon={incident.lon} />
              <Marker position={[incident.lat, incident.lon]} icon={makeIcon(incident.severity)}>
                <Popup>
                  <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, fontWeight: 700 }}>
                    {incident.severity} — {incident.summary}
                    <br />
                    {incident.location_text}
                  </div>
                </Popup>
              </Marker>
            </>
          )}
        </MapContainer>
      </div>
    </section>
  );
}
