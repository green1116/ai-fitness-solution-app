import { NextResponse } from "next/server";

import {
  buildSessionIntelligenceDetail,
  getSessionTimelineForDrilldown,
} from "@/lib/pilot/v83";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ sessionId: string }> };

export async function GET(_req: Request, { params }: RouteCtx) {
  return withPortalRoute("pilot", async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const { sessionId } = await params;
    try {
      const detail = buildSessionIntelligenceDetail(sessionId, ctx.organizationId);
      const timeline = getSessionTimelineForDrilldown(sessionId, ctx.organizationId);
      return NextResponse.json({ ok: true, detail, timeline, readOnly: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "NOT_FOUND";
      const status = message === "NOT_RELEASED" ? 404 : 500;
      return NextResponse.json({ ok: false, code: message, message }, { status });
    }
  });
}
