import { NextResponse } from "next/server";

import {
  acknowledgeComplianceFinding,
  getComplianceSnapshot,
  getIntakeSession,
  listComplianceRules,
  listKnowledgeReferences,
  runIntakeComplianceValidation,
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
      compliance: getComplianceSnapshot(sessionId),
      knowledgeRefs: listKnowledgeReferences(),
      rules: listComplianceRules().map((r) => ({
        id: r.id,
        category: r.category,
        severity: r.severity,
        title: r.title,
        description: r.description,
        knowledgeRefIds: r.knowledgeRefIds,
      })),
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
    const action = String(body?.action ?? "evaluate").trim();

    try {
      if (action === "evaluate") {
        const result = runIntakeComplianceValidation({
          sessionId,
          organizationId: ctx.organizationId,
          actorId: ctx.id,
          requirements: body?.requirements,
        });
        return NextResponse.json({
          ok: true,
          compliance: result.compliance,
          report: result.report,
        });
      }

      if (action === "acknowledge") {
        const result = acknowledgeComplianceFinding({
          sessionId,
          organizationId: ctx.organizationId,
          findingId: body?.findingId ? String(body.findingId) : undefined,
          ruleId: body?.ruleId ? String(body.ruleId) : undefined,
          actorId: ctx.id,
        });
        return NextResponse.json({
          ok: true,
          compliance: result.compliance,
          report: result.report,
        });
      }

      return NextResponse.json({ ok: false, code: "INVALID_ACTION" }, { status: 400 });
    } catch (err) {
      const message = err instanceof Error ? err.message : "COMPLIANCE_FAILED";
      const status =
        message === "SESSION_NOT_FOUND" || message === "ORG_MISMATCH"
          ? 404
          : message === "SESSION_FROZEN" ||
              message === "SESSION_LOCKED" ||
              message === "RELEASE_LOCKED"
            ? 409
            : message === "FINDING_REQUIRED" || message === "BLOCKING_CANNOT_ACKNOWLEDGE"
              ? 400
              : 500;
      return NextResponse.json({ ok: false, code: message, message }, { status });
    }
  });
}
