import { NextResponse } from "next/server";

import {
  buildCrossProjectExplorer,
  exportCrossProjectJson,
  findSimilarProjects,
} from "@/lib/pilot/v80";
import { withPilotRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET — org explorer or session similarity (?sessionId=) */
export async function GET(req: Request) {
  return withPilotRoute(req, async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId")?.trim() || undefined;
    const compareWith = url.searchParams.get("compareWith")?.trim() || undefined;
    const download = url.searchParams.get("download") === "1";
    const limit = Number(url.searchParams.get("limit") || "8");

    try {
      if (sessionId) {
        const report = findSimilarProjects({
          organizationId: ctx.organizationId,
          sessionId,
          compareWith,
          limit: Number.isFinite(limit) ? limit : 8,
        });
        if (download) {
          const exported = exportCrossProjectJson(report);
          return new NextResponse(exported.body, {
            status: 200,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Content-Disposition": `attachment; filename="${exported.fileName}"`,
            },
          });
        }
        return NextResponse.json({ ok: true, report });
      }

      const explorer = buildCrossProjectExplorer({
        organizationId: ctx.organizationId,
      });
      if (download) {
        const exported = exportCrossProjectJson(explorer);
        return new NextResponse(exported.body, {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Disposition": `attachment; filename="${exported.fileName}"`,
          },
        });
      }
      return NextResponse.json({ ok: true, explorer });
    } catch (e) {
      const message = e instanceof Error ? e.message : "SIMILARITY_FAILED";
      const status = message === "SESSION_NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ ok: false, code: message }, { status });
    }
  });
}
