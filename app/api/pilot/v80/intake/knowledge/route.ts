import { NextResponse } from "next/server";

import {
  buildOrgKnowledgeLibrary,
  exportOrgKnowledgeJson,
  getOrgKnowledgeGovernanceSnapshot,
  getOrgKnowledgeSnapshot,
  lookupOrgKnowledgeRecommendations,
  rebuildOrgKnowledgeLibrary,
} from "@/lib/pilot/v80";
import { withPilotRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET — org knowledge library / lookup / download */
export async function GET(req: Request) {
  return withPilotRoute(req, async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const url = new URL(req.url);
    const download = url.searchParams.get("download") === "1";
    const lookup = url.searchParams.get("lookup") === "1";
    const sessionId = url.searchParams.get("sessionId")?.trim() || undefined;
    const rebuild = url.searchParams.get("rebuild") === "1";
    const limit = Number(url.searchParams.get("limit") || "12");

    if (lookup) {
      const result = lookupOrgKnowledgeRecommendations({
        organizationId: ctx.organizationId,
        sessionId,
        limit: Number.isFinite(limit) ? limit : 12,
      });
      return NextResponse.json({ ok: true, lookup: result });
    }

    const library = rebuild
      ? rebuildOrgKnowledgeLibrary({
          organizationId: ctx.organizationId,
          actorId: ctx.id,
          sessionId,
        })
      : getOrgKnowledgeSnapshot(ctx.organizationId) ??
        buildOrgKnowledgeLibrary({ organizationId: ctx.organizationId });

    if (download) {
      const exported = exportOrgKnowledgeJson(library);
      return new NextResponse(exported.body, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${exported.fileName}"`,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      library,
      governance: getOrgKnowledgeGovernanceSnapshot(ctx.organizationId),
    });
  });
}

/** POST — rebuild library or lookup against draft requirements */
export async function POST(req: Request) {
  return withPilotRoute(req, async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      action?: string;
      sessionId?: string;
      requirements?: unknown;
      minFrequency?: number;
      limit?: number;
    };

    const action = body.action ?? "rebuild";

    if (action === "lookup") {
      const lookup = lookupOrgKnowledgeRecommendations({
        organizationId: ctx.organizationId,
        sessionId: body.sessionId,
        requirements: body.requirements as never,
        limit: body.limit ?? 12,
      });
      return NextResponse.json({ ok: true, lookup });
    }

    if (action === "rebuild" || action === "build") {
      const library = rebuildOrgKnowledgeLibrary({
        organizationId: ctx.organizationId,
        actorId: ctx.id,
        sessionId: body.sessionId,
        minFrequency: body.minFrequency,
      });
      return NextResponse.json({ ok: true, library });
    }

    return NextResponse.json({ ok: false, code: "UNKNOWN_ACTION" }, { status: 400 });
  });
}
