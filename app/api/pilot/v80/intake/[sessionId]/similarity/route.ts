import { NextResponse } from "next/server";

import {
  exportCrossProjectJson,
  findSimilarProjects,
  getIntakeSession,
} from "@/lib/pilot/v80";
import { withPilotRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ sessionId: string }> };

/** GET — similar projects + reuse artifacts for one session */
export async function GET(req: Request, { params }: RouteCtx) {
  return withPilotRoute(req, async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }
    const { sessionId } = await params;
    const session = getIntakeSession(sessionId);
    if (!session || session.organizationId !== ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
    }

    const url = new URL(req.url);
    const compareWith = url.searchParams.get("compareWith")?.trim() || undefined;
    const download = url.searchParams.get("download") === "1";
    const limit = Number(url.searchParams.get("limit") || "8");

    try {
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
    } catch (e) {
      const message = e instanceof Error ? e.message : "SIMILARITY_FAILED";
      return NextResponse.json({ ok: false, code: message }, { status: 400 });
    }
  });
}
