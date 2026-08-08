import { NextResponse } from "next/server";

import {
  buildIntakeSignoffReport,
  getIntakeSession,
  IntakeSignoffError,
  signOffIntakeSession,
} from "@/lib/pilot/v80";
import { withPilotRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ sessionId: string }> };

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

    try {
      const report = await buildIntakeSignoffReport(sessionId, ctx.organizationId);
      return NextResponse.json({ ok: true, report });
    } catch (err) {
      const message = err instanceof Error ? err.message : "SIGNOFF_READ_FAILED";
      const code = err instanceof IntakeSignoffError ? err.code : message;
      return NextResponse.json({ ok: false, code, message }, { status: 500 });
    }
  });
}

export async function POST(req: Request, { params }: RouteCtx) {
  return withPilotRoute(req, async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const { sessionId } = await params;
    const session = getIntakeSession(sessionId);
    if (!session || session.organizationId !== ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
    }

    try {
      const result = await signOffIntakeSession({
        sessionId,
        organizationId: ctx.organizationId,
        actorId: ctx.id,
      });

      return NextResponse.json({ ok: true, ...result });
    } catch (err) {
      const message = err instanceof Error ? err.message : "SIGNOFF_FAILED";
      const code = err instanceof IntakeSignoffError ? err.code : message;
      const status =
        code === "NOT_FROZEN" || code === "SIGNOFF_BLOCKED"
          ? 409
          : code === "ORG_MISMATCH"
            ? 403
            : 500;
      return NextResponse.json({ ok: false, code, message }, { status });
    }
  });
}
