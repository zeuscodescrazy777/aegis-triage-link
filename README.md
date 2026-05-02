# Aegis-112

**Real-Time Emergency Triage & Dispatch Console**

Aegis-112 is a high-density, government-grade operations dashboard designed for emergency dispatch centers. It provides live incident triage, geospatial situational awareness, and one-click dispatch authorization through a utilitarian, high-contrast interface optimized for 24/7 operator use.

---

## Overview

Aegis-112 is built to the visual and operational standards of public-safety command systems: no gradients, no decorative animation, thick borders, bold typography, and information density over whitespace. Every pixel is justified by operational value.

### Key Capabilities

- **Live Triage Feed** — Real-time incident stream sorted by severity (RED → AMBER → GREEN) with live age counters.
- **Geospatial Awareness** — Leaflet-based live map with severity-coded markers; auto-recenters on incident selection.
- **Dispatch Authorization** — One-click `AUTHORIZE DISPATCH` action that proxies to an external workflow webhook (n8n) and updates incident status atomically.
- **Real-Time Sync** — Postgres logical replication via Supabase Realtime; new incidents appear in the feed without polling.
- **System Clock & Status Bar** — Persistent UTC clock and "Official Use" branding in the operator chrome.

---

## Technology Stack

| Layer            | Technology                                          |
| ---------------- | --------------------------------------------------- |
| Framework        | TanStack Start (React 19, Vite 7, SSR)              |
| Language         | TypeScript (strict)                                 |
| Styling          | Tailwind CSS v4 + OKLCH design tokens               |
| Backend          | Lovable Cloud (managed Postgres, Auth, Realtime)    |
| Mapping          | Leaflet + OpenStreetMap tiles                       |
| Icons            | lucide-react                                        |
| Dispatch Hook    | Server route → external n8n webhook                 |

---

## Architecture

```
src/
├── routes/
│   ├── __root.tsx              # Root shell
│   ├── index.tsx               # Operator dashboard
│   └── api/dispatch.ts         # Dispatch proxy → n8n webhook
├── components/aegis/
│   ├── Navbar.tsx              # Status bar + system clock
│   ├── TriageFeed.tsx          # Real-time severity-sorted feed
│   ├── IncidentDetails.tsx     # Selected incident + dispatch action
│   ├── LiveMap.tsx             # Leaflet map (lazy-loaded, SSR-safe)
│   ├── SeverityTag.tsx         # RED / AMBER / GREEN badge
│   └── types.ts                # Shared incident types
├── integrations/supabase/      # Auto-generated client + types
└── styles.css                  # Design tokens (OKLCH, 0px radius)
```

### Data Model

The `incidents` table uses two enums:

- `severity`: `RED` | `AMBER` | `GREEN`
- `status`: `PENDING` | `DISPATCHED`

Realtime is enabled on `public.incidents`; the client subscribes to `INSERT` and `UPDATE` events and merges them into local state.

### Dispatch Flow

```
Operator clicks AUTHORIZE DISPATCH
        │
        ▼
POST /api/dispatch  (server route)
        │
        ├──▶ POST  N8N_WEBHOOK_URL   (external workflow)
        └──▶ UPDATE incidents SET status = 'DISPATCHED'
```

---

## Design System

Aegis-112 enforces a strict government aesthetic via tokens defined in `src/styles.css`:

| Token              | Value           | Usage                        |
| ------------------ | --------------- | ---------------------------- |
| Official Navy      | `#112E51`       | Primary chrome, headers      |
| Alert Red          | `#D91E18`       | RED severity                 |
| Alert Amber        | `#F39C12`       | AMBER severity               |
| Alert Green        | `#27AE60`       | GREEN severity / dispatched  |
| Border width       | `2px` – `3px`   | All panels                   |
| Border radius      | `0px` (global)  | No rounded corners           |
| Shadows / gradients| **Forbidden**   | —                            |

---

## Getting Started

### Prerequisites

- Node.js 20+ or Bun
- A Lovable Cloud–enabled project (backend is auto-provisioned)

### Local Development

```bash
bun install
bun run dev
```

The app runs at `http://localhost:5173`. Backend credentials are injected via `.env` automatically.

### Environment Variables

| Variable                       | Source         | Purpose                              |
| ------------------------------ | -------------- | ------------------------------------ |
| `VITE_SUPABASE_URL`            | Auto-managed   | Backend endpoint                     |
| `VITE_SUPABASE_PUBLISHABLE_KEY`| Auto-managed   | Public client key                    |
| `N8N_WEBHOOK_URL`              | Server secret  | External dispatch workflow target    |

---

## Deployment

This project is configured for edge deployment (Cloudflare Workers via Wrangler). Publish through the Lovable interface; backend, secrets, and migrations deploy together.

---

## Operational Notes

- **No authentication by design.** Aegis-112 is intended to run inside a hardened operations network. RLS policies on `incidents` are intentionally permissive for the operator console; do **not** expose this deployment to the public internet without adding an authentication layer.
- **Realtime fallback.** If the websocket disconnects, the feed re-fetches on reconnect — no incidents are silently lost.
- **SSR safety.** The map and any `Date.now()`-derived state are guarded against hydration mismatches.

---

## License

Proprietary — internal operational use only.
