import { NextResponse } from "next/server";

import { buildExecutiveArchiveDashboard, searchArchiveDashboard } from "@/lib/pilot/v96";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return withPortalRoute("pilot", async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") ?? "";

    try {
      const dashboard = buildExecutiveArchiveDashboard(ctx.organizationId);
      if (query.trim()) {
        const search = searchArchiveDashboard({
          organizationId: ctx.organizationId,
          query,
        });
        return NextResponse.json({ ok: true, dashboard, search, readOnly: true });
      }
      return NextResponse.json({ ok: true, dashboard, readOnly: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "ARCHIVE_FAILED";
      return NextResponse.json({ ok: false, code: message, message }, { status: 500 });
    }
  });
}
