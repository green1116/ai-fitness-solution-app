import { NextResponse } from "next/server";

import {
  getIntakeSession,
  patchIntakeRequirements,
  resetIntakeRequirements,
} from "@/lib/pilot/v80";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ sessionId: string }> };

export async function GET(_req: Request, { params }: RouteCtx) {
  return withPortalRoute("pilot", async (ctx) => {
    const { sessionId } = await params;
    const session = getIntakeSession(sessionId);
    if (!session || session.organizationId !== ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      session: {
        id: session.id,
        tenderIntakeId: session.tenderIntakeId,
        status: session.status,
        fileName: session.fileName,
        fileSize: session.fileSize,
        requirements: session.requirements,
        extractedRequirements: session.extractedRequirements,
        productionProjectId: session.productionProjectId,
        productionTenderId: session.productionTenderId,
        productionQuoteId: session.productionQuoteId,
        v80TenderId: session.v80TenderId,
        v80QuoteId: session.v80QuoteId,
        v80WorkflowJobId: session.v80WorkflowJobId,
        workflowStatus: session.workflowStatus,
        frozen: session.frozen,
        frozenAt: session.frozenAt,
        freezeReasonCode: session.freezeReasonCode,
        deliveryLocked: session.deliveryLocked,
        meta: {
          pageCount: session.parseResult.pages.length,
          chars: session.parseResult.rawText.length,
        },
      },
    });
  });
}

export async function PATCH(req: Request, { params }: RouteCtx) {
  return withPortalRoute("pilot", async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const { sessionId } = await params;
    const body = await req.json().catch(() => ({}));

    try {
      if (body?.reset === true) {
        const result = resetIntakeRequirements({
          sessionId,
          organizationId: ctx.organizationId,
          actorId: ctx.id,
        });
        return NextResponse.json({
          ok: true,
          session: result.session,
          requirements: result.requirements,
          validation: result.validation,
        });
      }

      const requirements = body?.requirements;
      if (!requirements || typeof requirements !== "object") {
        return NextResponse.json({ ok: false, code: "REQUIREMENTS_REQUIRED" }, { status: 400 });
      }

      const result = patchIntakeRequirements({
        sessionId,
        organizationId: ctx.organizationId,
        requirements,
        actorId: ctx.id,
      });

      return NextResponse.json({
        ok: true,
        session: result.session,
        requirements: result.requirements,
        validation: result.validation,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "PATCH_FAILED";
      const status =
        message === "NOT_FOUND" || message === "SESSION_NOT_FOUND"
          ? 404
          : message === "ALREADY_APPROVED"
            ? 409
            : message === "SESSION_LOCKED"
              ? 409
              : message === "SESSION_FROZEN"
                ? 409
                : message === "NO_EXTRACTED_SNAPSHOT"
              ? 400
              : 500;
      return NextResponse.json({ ok: false, code: message, message }, { status });
    }
  });
}
