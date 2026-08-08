import { NextResponse } from "next/server";

import {
  exportProductionHardeningJson,
  listRegressionSuiteCatalog,
  runProductionHardeningChecks,
} from "@/lib/pilot/v80";
import { withPilotRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET — production readiness / hardening report */
export async function GET(req: Request) {
  return withPilotRoute(req, async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const url = new URL(req.url);
    const download = url.searchParams.get("download") === "1";
    const catalogOnly = url.searchParams.get("catalog") === "1";

    if (catalogOnly) {
      return NextResponse.json({
        ok: true,
        regressionCatalog: listRegressionSuiteCatalog(),
      });
    }

    const report = runProductionHardeningChecks({
      organizationId: ctx.organizationId,
      seedDemoData: true,
    });

    if (download) {
      const exported = exportProductionHardeningJson(report);
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
