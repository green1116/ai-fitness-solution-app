import { NextResponse } from "next/server";

import { buildBriefingPackDetail } from "@/lib/pilot/v94";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ packId: string }> };

export async function GET(_req: Request, { params }: RouteCtx) {
  return withPortalRoute("pilot", async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const { packId } = await params;
    try {
      const detail = buildBriefingPackDetail(ctx.organizationId, packId);
      return NextResponse.json({ ok: true, detail, readOnly: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "NOT_FOUND";
      const status = message === "BRIEFING_NOT_FOUND" ? 404 : 500;
      return NextResponse.json({ ok: false, code: message, message }, { status });
    }
  });
}
