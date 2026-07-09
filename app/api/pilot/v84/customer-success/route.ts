import { NextResponse } from "next/server";

import { buildCrmDashboard } from "@/lib/pilot/v84";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withPortalRoute("pilot", async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    try {
      const crm = buildCrmDashboard(ctx.organizationId);
      return NextResponse.json({ ok: true, crm, readOnly: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "CRM_FAILED";
      return NextResponse.json({ ok: false, code: message, message }, { status: 500 });
    }
  });
}
