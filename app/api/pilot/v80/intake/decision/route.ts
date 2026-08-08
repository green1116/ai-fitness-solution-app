import { NextResponse } from "next/server";

import {
  buildEnterpriseDecisionReport,
  exportEnterpriseDecisionJson,
  getSessionDecisionSnapshot,
} from "@/lib/pilot/v80";
import { withPilotRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET — enterprise decision report / session snapshot / download */
export async function GET(req: Request) {
  return withPilotRoute(req, async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const url = new URL(req.url);
    const from = url.searchParams.get("from")?.trim() || undefined;
    const to = url.searchParams.get("to")?.trim() || undefined;
    const download = url.searchParams.get("download") === "1";
    const sessionId = url.searchParams.get("sessionId")?.trim() || undefined;

    try {
      if (sessionId) {
        const snapshot = getSessionDecisionSnapshot({
          organizationId: ctx.organizationId,
          sessionId,
        });
        return NextResponse.json({ ok: true, snapshot });
      }

      const report = buildEnterpriseDecisionReport({
        organizationId: ctx.organizationId,
        from,
        to,
      });

      if (download) {
        const exported = exportEnterpriseDecisionJson(report);
        return new NextResponse(exported.body, {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Disposition": `attachment; filename="${exported.fileName}"`,
          },
        });
      }

      return NextResponse.json({ ok: true, report });
    } catch (e) {
      const message = e instanceof Error ? e.message : "DECISION_FAILED";
      const status = message === "SESSION_NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ ok: false, code: message }, { status });
    }
  });
}
