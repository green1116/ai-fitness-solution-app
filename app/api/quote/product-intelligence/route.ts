import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { FeatureGateError } from "@/lib/feature-flags/feature-gate";
import { growthAwareGateErrorResponse } from "@/lib/growth/growth.api-helper";
import { ProductSelectionInputError } from "@/lib/product-engine";
import { runSaasApiGate, saasGateErrorResponse, trackFeatureUsage } from "@/lib/saas/api-gate";
import {
  createQuoteVersionWithSelections,
  getQuoteProductIntelligence,
} from "@/lib/services/quote.service";

const ENDPOINT = "/api/quote/product-intelligence";

function errorResponse(
  err: unknown,
  ctx: { organizationId?: string; userId?: string; traceId?: string },
  fallbackMessage: string,
) {
  if (err instanceof FeatureGateError) {
    return growthAwareGateErrorResponse(err, {
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      feature: "canGenerateQuote",
      traceId: ctx.traceId,
    });
  }
  if (isKnownApiError(err)) {
    return handleApiError(err, {
      traceId: ctx.traceId ?? "unknown",
      endpoint: ENDPOINT,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
    });
  }
  if (err instanceof Error && err.name === "SaasAuthError") {
    return saasGateErrorResponse(err, ctx.traceId);
  }
  if (err instanceof ProductSelectionInputError) {
    return NextResponse.json(
      { ok: false, message: err.message, traceId: ctx.traceId },
      { status: 400 },
    );
  }
  if (err instanceof Error && err.message === "Quote not found") {
    return NextResponse.json(
      { ok: false, message: err.message, traceId: ctx.traceId },
      { status: 404 },
    );
  }
  if (err instanceof Error && err.message === "Quote is not READY") {
    return NextResponse.json(
      { ok: false, message: err.message, traceId: ctx.traceId },
      { status: 409 },
    );
  }
  console.error(`[quote/product-intelligence]`, err);
  return NextResponse.json(
    { ok: false, message: err instanceof Error ? err.message : fallbackMessage, traceId: ctx.traceId },
    { status: 500 },
  );
}

export async function GET(req: NextRequest) {
  const ctx: { organizationId?: string; userId?: string; traceId?: string } = {};
  try {
    const quoteId = String(req.nextUrl.searchParams.get("quoteId") ?? "").trim();
    const queryOrg = String(req.nextUrl.searchParams.get("organizationId") ?? "").trim();
    const gate = await runSaasApiGate(req, "canGenerateQuote", {
      quoteId,
      ...(queryOrg ? { organizationId: queryOrg } : {}),
    });
    ctx.organizationId = gate.organizationId;
    ctx.userId = gate.userId;
    ctx.traceId = gate.traceId;

    if (!quoteId) {
      return NextResponse.json(
        { ok: false, message: "缺少 quoteId", traceId: gate.traceId },
        { status: 400 },
      );
    }

    const view = await getQuoteProductIntelligence({
      quoteId,
      organizationId: gate.organizationId,
    });
    return NextResponse.json({ ok: true, ...view, traceId: gate.traceId });
  } catch (err: unknown) {
    return errorResponse(err, ctx, "候选配置加载失败");
  }
}

/** Save professional selections → NEW Quote version (base Quote untouched). */
export async function POST(req: NextRequest) {
  const ctx: { organizationId?: string; userId?: string; traceId?: string } = {};
  try {
    const body = await req.json();
    const gate = await runSaasApiGate(req, "canGenerateQuote", body);
    ctx.organizationId = gate.organizationId;
    ctx.userId = gate.userId;
    ctx.traceId = gate.traceId;

    const baseQuoteId = String(body?.quoteId ?? "").trim();
    if (!baseQuoteId) {
      return NextResponse.json(
        { ok: false, message: "缺少 quoteId", traceId: gate.traceId },
        { status: 400 },
      );
    }

    const result = await createQuoteVersionWithSelections({
      baseQuoteId,
      organizationId: gate.organizationId,
      selections: body?.selections,
      decidedBy: gate.userId,
    });

    await trackFeatureUsage(gate.organizationId, "canGenerateQuote");

    return NextResponse.json({
      ok: true,
      baseQuoteId,
      quoteId: result.quote.id,
      projectId: result.quote.projectId,
      status: result.quote.status,
      proposal: result.engine.proposal,
      traceId: gate.traceId,
    });
  } catch (err: unknown) {
    return errorResponse(err, ctx, "候选配置保存失败");
  }
}
