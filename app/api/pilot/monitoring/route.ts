import { NextResponse } from "next/server";
import { buildPilotMonitoringReport } from "@/lib/portal/v62/monitoring/pilot-monitoring.engine";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withPortalRoute("pilot", async (ctx) => {
    const monitoring = await buildPilotMonitoringReport(ctx.organizationId ?? undefined);
    return NextResponse.json({ ok: true, monitoring });
  });
}
