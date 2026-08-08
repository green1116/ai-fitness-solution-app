import { NextResponse } from "next/server";

import {
  buildIntakeAnalyticsReport,
  exportIntakeAnalyticsJson,
} from "@/lib/pilot/v80";
import { withPilotRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET — intake intelligence analytics (read-only) */
export async function GET(req: Request) {
  return withPilotRoute(req, async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const url = new URL(req.url);
    const from = url.searchParams.get("from")?.trim() || undefined;
    const to = url.searchParams.get("to")?.trim() || undefined;
    const download = url.searchParams.get("download") === "1";

    const report = buildIntakeAnalyticsReport({
      organizationId: ctx.organizationId,
      from,
      to,
    });

    if (download) {
      const exported = exportIntakeAnalyticsJson(report);
      return new NextResponse(exported.body, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${exported.fileName}"`,
        },
      });
    }

    return NextResponse.json({ ok: true, report });
  });
}
