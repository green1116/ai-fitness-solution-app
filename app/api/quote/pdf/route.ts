import { NextRequest, NextResponse } from "next/server";
import { QuoteStatus } from "@prisma/client";

import { resolveEntitledPlanDocumentTier } from "@/lib/commercial/planDocumentTier";
import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { FeatureGateError } from "@/lib/feature-flags/feature-gate";
import { growthAwareGateErrorResponse } from "@/lib/growth/growth.api-helper";
import { resolveRequestEntitlement } from "@/lib/entitlements/resolveEntitlement";
import { renderPlanPdf } from "@/lib/pdf/renderPlanPdf";
import { runSaasApiGate, saasGateErrorResponse } from "@/lib/saas/api-gate";
import {
  ensureQuotePlanPdfSource,
  getQuoteById,
} from "@/lib/services/quote.service";
import { assertResourceBelongsToTenant } from "@/lib/tenancy/tenant.guard";

export async function GET(req: NextRequest) {
  let organizationId: string | undefined;
  let userId: string | undefined;
  let traceId: string | undefined;

  try {
    const quoteId = String(req.nextUrl.searchParams.get("quoteId") ?? "").trim();
    const queryOrg = String(req.nextUrl.searchParams.get("organizationId") ?? "").trim();
    const gate = await runSaasApiGate(req, "canGenerateQuote", {
      quoteId,
      ...(queryOrg ? { organizationId: queryOrg } : {}),
    });
    organizationId = gate.organizationId;
    userId = gate.userId;
    traceId = gate.traceId;

    if (!quoteId) {
      return NextResponse.json(
        { ok: false, message: "缺少 quoteId", traceId: gate.traceId },
        { status: 400 },
      );
    }

    const quote = await getQuoteById(quoteId);
    if (!quote) {
      return NextResponse.json(
        { ok: false, message: "Quote not found", traceId: gate.traceId },
        { status: 404 },
      );
    }

    assertResourceBelongsToTenant(
      quote.organizationId ?? quote.project.organizationId,
      gate.organizationId,
    );

    if (quote.status !== QuoteStatus.READY) {
      return NextResponse.json(
        { ok: false, message: "Quote is not READY", traceId: gate.traceId },
        { status: 409 },
      );
    }

    const { entitlement } = await resolveRequestEntitlement({
      req,
      planId: quote.projectId,
    });
    const renderTier = resolveEntitledPlanDocumentTier(entitlement);

    const project = await ensureQuotePlanPdfSource(quote.id);
    const solution = project.solution;
    if (!solution) {
      return NextResponse.json(
        { ok: false, message: "Solution not found", traceId: gate.traceId },
        { status: 500 },
      );
    }
    const pdfBytes = await renderPlanPdf(project, solution, project.placeholders, {
      tier: renderTier,
    });

    const filename =
      renderTier === "free"
        ? `quote-preview-${quote.id}.pdf`
        : `quote-${quote.id}.pdf`;
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Plan-Document-Tier": renderTier,
      },
    });
  } catch (err: unknown) {
    if (err instanceof FeatureGateError) {
      return growthAwareGateErrorResponse(err, {
        organizationId,
        userId,
        feature: "canGenerateQuote",
        traceId,
      });
    }
    if (isKnownApiError(err)) {
      return handleApiError(err, {
        traceId: traceId ?? "unknown",
        endpoint: "/api/quote/pdf",
        organizationId,
        userId,
      });
    }
    if (err instanceof Error && err.name === "SaasAuthError") {
      return saasGateErrorResponse(err, traceId);
    }
    console.error("[quote/pdf]", err);
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "方案 PDF 导出失败", traceId },
      { status: 500 },
    );
  }
}
