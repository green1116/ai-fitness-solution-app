import { NextResponse } from "next/server";
import { buildPilotHealthDashboard } from "@/lib/portal/v62/pilot/pilot-health.engine";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withPortalRoute("pilot", async (ctx) => {
    const dashboard = buildPilotHealthDashboard(ctx.organizationId ?? undefined);
    return NextResponse.json({ ok: true, dashboard });
  });
}
