import { NextResponse } from "next/server";

import { buildRenewalOpsDashboard } from "@/lib/pilot/v86";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withPortalRoute("pilot", async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    try {
      const dashboard = buildRenewalOpsDashboard(ctx.organizationId);
      return NextResponse.json({ ok: true, dashboard, readOnly: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "RENEWAL_OPS_FAILED";
      return NextResponse.json({ ok: false, code: message, message }, { status: 500 });
    }
  });
}
