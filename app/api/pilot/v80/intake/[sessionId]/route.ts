import { NextResponse } from "next/server";

import {
  bulkSetRequirementItemReview,
  getIntakeSession,
  patchIntakeRequirements,
  resetIntakeRequirements,
  setRequirementEvidenceOverride,
  setRequirementItemReview,
  type RequirementItemListKey,
  type RequirementReviewStatus,
} from "@/lib/pilot/v80";
import { withPilotRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ sessionId: string }> };

const LIST_KEYS = new Set<RequirementItemListKey>([
  "functionalRequirements",
  "technicalRequirements",
  "equipment",
  "space",
  "quantity",
  "constraints",
  "compliance",
  "standards",
  "evaluation",
  "optionalItems",
]);

const REVIEW_STATUSES = new Set<RequirementReviewStatus>([
  "pending",
  "confirmed",
  "rejected",
]);

export async function GET(req: Request, { params }: RouteCtx) {
  return withPilotRoute(req, async (ctx) => {
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
        requirementsRevision: session.requirementsRevision ?? 0,
        clarifications: session.clarifications ?? null,
        documents: (session.documents ?? []).map((d) => ({
          id: d.id,
          fileName: d.fileName,
          docType: d.docType,
          order: d.order,
          priority: d.priority,
          status: d.status,
        })),
        consolidation: session.consolidation ?? null,
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
  return withPilotRoute(req, async (ctx) => {
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
          revision: result.revision,
        });
      }

      if (body?.itemReview && typeof body.itemReview === "object") {
        const listKey = String(body.itemReview.listKey ?? "") as RequirementItemListKey;
        const itemId = String(body.itemReview.itemId ?? "").trim();
        const reviewStatus = String(
          body.itemReview.reviewStatus ?? "",
        ) as RequirementReviewStatus;
        if (!LIST_KEYS.has(listKey) || !itemId || !REVIEW_STATUSES.has(reviewStatus)) {
          return NextResponse.json({ ok: false, code: "INVALID_ITEM_REVIEW" }, { status: 400 });
        }
        const result = setRequirementItemReview({
          sessionId,
          organizationId: ctx.organizationId,
          listKey,
          itemId,
          reviewStatus,
          actorId: ctx.id,
        });
        return NextResponse.json({
          ok: true,
          session: result.session,
          requirements: result.requirements,
          validation: result.validation,
          revision: result.revision,
        });
      }

      if (body?.evidenceOverride && typeof body.evidenceOverride === "object") {
        const listKey = String(body.evidenceOverride.listKey ?? "") as RequirementItemListKey;
        const itemId = String(body.evidenceOverride.itemId ?? "").trim();
        const evidenceOverride = body.evidenceOverride.override === true;
        if (!LIST_KEYS.has(listKey) || !itemId) {
          return NextResponse.json(
            { ok: false, code: "INVALID_EVIDENCE_OVERRIDE" },
            { status: 400 },
          );
        }
        const result = setRequirementEvidenceOverride({
          sessionId,
          organizationId: ctx.organizationId,
          listKey,
          itemId,
          evidenceOverride,
          note: body.evidenceOverride.note
            ? String(body.evidenceOverride.note)
            : undefined,
          actorId: ctx.id,
        });
        return NextResponse.json({
          ok: true,
          session: result.session,
          requirements: result.requirements,
          validation: result.validation,
          revision: result.revision,
        });
      }

      if (body?.bulkReview && typeof body.bulkReview === "object") {
        const reviewStatus = String(
          body.bulkReview.reviewStatus ?? "",
        ) as RequirementReviewStatus;
        if (!REVIEW_STATUSES.has(reviewStatus)) {
          return NextResponse.json({ ok: false, code: "INVALID_BULK_REVIEW" }, { status: 400 });
        }
        const result = bulkSetRequirementItemReview({
          sessionId,
          organizationId: ctx.organizationId,
          reviewStatus,
          mustOnly: body.bulkReview.mustOnly !== false,
          actorId: ctx.id,
        });
        return NextResponse.json({
          ok: true,
          session: result.session,
          requirements: result.requirements,
          validation: result.validation,
          revision: result.revision,
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
        revision: result.revision,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "PATCH_FAILED";
      const status =
        message === "NOT_FOUND" ||
        message === "SESSION_NOT_FOUND" ||
        message === "ITEM_NOT_FOUND"
          ? 404
          : message === "ALREADY_APPROVED" ||
              message === "SESSION_LOCKED" ||
              message === "SESSION_FROZEN" ||
              message === "RELEASE_LOCKED"
            ? 409
            : message === "NO_EXTRACTED_SNAPSHOT"
              ? 400
              : 500;
      return NextResponse.json({ ok: false, code: message, message }, { status });
    }
  });
}
