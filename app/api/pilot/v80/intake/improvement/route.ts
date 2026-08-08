import { NextResponse } from "next/server";

import {
  applyImprovementGovernanceFeedback,
  buildContinuousImprovementReport,
  exportContinuousImprovementJson,
} from "@/lib/pilot/v80";
import { withPilotRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET — continuous improvement report */
export async function GET(req: Request) {
  return withPilotRoute(req, async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const url = new URL(req.url);
    const download = url.searchParams.get("download") === "1";

    const report = buildContinuousImprovementReport({
      organizationId: ctx.organizationId,
      persistAdjustments: true,
    });

    if (download) {
      const exported = exportContinuousImprovementJson(report);
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

/** POST — refresh / apply governance feedback */
export async function POST(req: Request) {
  return withPilotRoute(req, async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      action?: string;
      dryRun?: boolean;
      maxActions?: number;
      patternIds?: string[];
      actions?: Array<"promote" | "demote" | "deprecate" | "review" | "keep">;
      sessionId?: string;
    };

    const action = body.action ?? "refresh";

    if (action === "refresh" || action === "report") {
      const report = buildContinuousImprovementReport({
        organizationId: ctx.organizationId,
        persistAdjustments: true,
      });
      return NextResponse.json({ ok: true, report });
    }

    if (action === "apply" || action === "apply_feedback") {
      const result = applyImprovementGovernanceFeedback({
        organizationId: ctx.organizationId,
        actorId: ctx.id,
        dryRun: body.dryRun === true,
        maxActions: body.maxActions,
        patternIds: body.patternIds,
        actions: body.actions,
        sessionId: body.sessionId,
      });
      return NextResponse.json({
        ok: true,
        report: result.report,
        results: result.results,
      });
    }

    return NextResponse.json({ ok: false, code: "UNKNOWN_ACTION" }, { status: 400 });
  });
}
