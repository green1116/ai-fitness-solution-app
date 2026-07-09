import { NextResponse } from "next/server";

import {
  extractRequirementsFromParsedTender,
  getIntakeSession,
  updateIntakeSession,
} from "@/lib/pilot/v80";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return withPortalRoute("pilot", async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const sessionId = String(body?.sessionId ?? "").trim();
    if (!sessionId) {
      return NextResponse.json({ ok: false, code: "SESSION_REQUIRED" }, { status: 400 });
    }

    const session = getIntakeSession(sessionId);
    if (!session || session.organizationId !== ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
    }

    const requirements = extractRequirementsFromParsedTender({
      parseResult: session.parseResult,
      sourceName: session.fileName,
    });

    const updated = updateIntakeSession(sessionId, {
      status: "extracted",
      requirements,
      extractedRequirements: requirements,
    });

    return NextResponse.json({
      ok: true,
      sessionId,
      requirements: updated?.requirements ?? requirements,
    });
  });
}
