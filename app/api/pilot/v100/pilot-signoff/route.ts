import { NextResponse } from "next/server";

import { buildPilotSignoffDashboard } from "@/lib/pilot/v100";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withPortalRoute("pilot", async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    try {
      const dashboard = buildPilotSignoffDashboard(ctx.organizationId);
      return NextResponse.json({ ok: true, dashboard, readOnly: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "SIGNOFF_FAILED";
      return NextResponse.json({ ok: false, code: message, message }, { status: 500 });
    }
  });
}
