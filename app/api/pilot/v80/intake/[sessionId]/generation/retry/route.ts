import { NextResponse } from "next/server";

import { getIntakeSession, retryIntakeGeneration } from "@/lib/pilot/v80";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ sessionId: string }> };

export async function POST(_req: Request, { params }: RouteCtx) {
  return withPortalRoute("pilot", async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const { sessionId } = await params;
    const session = getIntakeSession(sessionId);
    if (!session || session.organizationId !== ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
    }

    try {
      const result = await retryIntakeGeneration({
        sessionId,
        organizationId: ctx.organizationId,
        actorId: ctx.id,
      });
      return NextResponse.json({ ok: true, ...result });
    } catch (err) {
      const message = err instanceof Error ? err.message : "RETRY_FAILED";
      const status =
        message === "SESSION_NOT_FOUND" || message === "ORG_MISMATCH"
          ? 404
          : message === "ENTITIES_NOT_CREATED"
            ? 400
            : message === "APPROVE_IN_PROGRESS"
              ? 409
              : 500;
      return NextResponse.json({ ok: false, code: message, message }, { status });
    }
  });
}
