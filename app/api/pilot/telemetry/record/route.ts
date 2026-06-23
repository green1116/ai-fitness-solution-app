import { NextResponse } from "next/server";
import {
  PILOT_TELEMETRY_EVENTS,
  type PilotTelemetryEventName,
} from "@/lib/portal/v62/store/pilot-telemetry.store";
import { recordPilotTelemetry } from "@/lib/portal/v62/store/pilot-telemetry.store";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return withPortalRoute("authenticated", async (ctx) => {
    const body = await req.json().catch(() => ({}));
    const name = String(body?.name ?? "") as PilotTelemetryEventName;
    const success = body?.success !== false;

    if (!PILOT_TELEMETRY_EVENTS.includes(name)) {
      return NextResponse.json({ ok: false, code: "INVALID_EVENT" }, { status: 400 });
    }

    const event = recordPilotTelemetry({
      name,
      organizationId: ctx.organizationId ?? undefined,
      userId: ctx.id,
      projectId: body?.projectId ? String(body.projectId) : undefined,
      success,
      meta: body?.meta && typeof body.meta === "object" ? body.meta : undefined,
    });

    return NextResponse.json({ ok: true, event });
  });
}
