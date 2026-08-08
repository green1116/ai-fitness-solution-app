import { NextResponse } from "next/server";

import {
  exportIntakeHandoffPackageJson,
  generateIntakeHandoffPackage,
  getIntakeHandoffPackage,
  getIntakeSession,
  type HandoffAudience,
} from "@/lib/pilot/v80";
import { withPilotRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ sessionId: string }> };

const AUDIENCES = new Set<HandoffAudience>(["internal", "customer"]);

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
    const audienceRaw = String(url.searchParams.get("audience") ?? "internal");
    const audience = AUDIENCES.has(audienceRaw as HandoffAudience)
      ? (audienceRaw as HandoffAudience)
      : "internal";
    const download = url.searchParams.get("download") === "1";

    if (download) {
      try {
        const exported = exportIntakeHandoffPackageJson(
          sessionId,
          ctx.organizationId,
          audience,
        );
        return new NextResponse(exported.body, {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Disposition": `attachment; filename="${exported.fileName}"`,
          },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "EXPORT_FAILED";
        return NextResponse.json({ ok: false, code: message, message }, { status: 500 });
      }
    }

    const pkg = getIntakeHandoffPackage(sessionId, audience);
    return NextResponse.json({
      ok: true,
      package: pkg,
      persisted: session.handoff ?? null,
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
    const audienceRaw = String(body?.audience ?? "internal");
    const audience = AUDIENCES.has(audienceRaw as HandoffAudience)
      ? (audienceRaw as HandoffAudience)
      : "internal";

    try {
      const result = generateIntakeHandoffPackage({
        sessionId,
        organizationId: ctx.organizationId,
        actorId: ctx.id,
        audience,
      });
      return NextResponse.json({
        ok: true,
        package: result.package,
        handoff: result.handoff,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "HANDOFF_PACKAGE_FAILED";
      const status =
        message === "SESSION_NOT_FOUND" || message === "ORG_MISMATCH" ? 404 : 500;
      return NextResponse.json({ ok: false, code: message, message }, { status });
    }
  });
}
