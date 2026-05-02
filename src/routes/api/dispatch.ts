import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/dispatch")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const webhookUrl = process.env.N8N_WEBHOOK_URL;
        if (!webhookUrl) {
          return Response.json(
            { ok: false, error: "N8N_WEBHOOK_URL is not configured" },
            { status: 500 }
          );
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
        }

        try {
          const res = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "AUTHORIZE_DISPATCH",
              authorized_at: new Date().toISOString(),
              payload: body,
            }),
          });

          if (!res.ok) {
            const text = await res.text().catch(() => "");
            return Response.json(
              { ok: false, error: `Webhook responded ${res.status}: ${text.slice(0, 200)}` },
              { status: 502 }
            );
          }

          return Response.json({ ok: true });
        } catch (e) {
          return Response.json(
            { ok: false, error: `Webhook call failed: ${(e as Error).message}` },
            { status: 502 }
          );
        }
      },
    },
  },
});
