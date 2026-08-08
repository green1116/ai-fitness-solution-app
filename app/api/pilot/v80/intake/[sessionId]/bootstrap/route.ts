import { NextResponse } from "next/server";

import {
  getIntakeSession,
  getProjectBootstrap,
  seedProjectBootstrap,
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
    return NextResponse.json({
      ok: true,
      bootstrap: getProjectBootstrap(sessionId),
      hasProject: Boolean(session.productionProjectId),
    });
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

    const body = await req.json().catch(() => ({}));
    try {
      const result = await seedProjectBootstrap({
        sessionId,
        organizationId: ctx.organizationId,
        actorId: ctx.id,
        actorEmail: ctx.email,
        persistProduction: body?.persistProduction !== false,
      });
      return NextResponse.json({
        ok: true,
        bootstrap: result.bootstrap,
        package: result.package,
        idempotent: result.idempotent,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "BOOTSTRAP_FAILED";
      const status =
        message === "SESSION_NOT_FOUND" || message === "ORG_MISMATCH"
          ? 404
          : message === "PROJECT_NOT_CREATED"
            ? 400
            : 500;
      return NextResponse.json({ ok: false, code: message, message }, { status });
    }
  });
}
