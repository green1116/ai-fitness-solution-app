import { NextResponse } from "next/server";

import { getIntakeSession, reExtractIntakeRequirements } from "@/lib/pilot/v80";
import { withPilotRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return withPilotRoute(req, async (ctx) => {
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

    const mode = body?.mode === "working_only" ? "working_only" : "replace";

    try {
      const result = reExtractIntakeRequirements({
        sessionId,
        organizationId: ctx.organizationId,
        actorId: ctx.id,
        mode,
      });

      return NextResponse.json({
        ok: true,
        sessionId,
        requirements: result.requirements,
        validation: result.validation,
        revision: result.revision,
        mode,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "REEXTRACT_FAILED";
      const status =
        message === "SESSION_FROZEN" ||
        message === "ALREADY_APPROVED" ||
        message === "SESSION_LOCKED" ||
        message === "RELEASE_LOCKED"
          ? 409
          : 500;
      return NextResponse.json({ ok: false, code: message, message }, { status });
    }
  });
}
