import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { FeatureGateError } from "@/lib/feature-flags/feature-gate";
import { growthAwareGateErrorResponse } from "@/lib/growth/growth.api-helper";
import { runSaasApiGate, saasGateErrorResponse } from "@/lib/saas/api-gate";
import { listQuotesForProject } from "@/lib/services/quote.service";

export async function GET(req: NextRequest) {
  let organizationId: string | undefined;
  let userId: string | undefined;
  let traceId: string | undefined;

  try {
    const projectId = String(req.nextUrl.searchParams.get("projectId") ?? "").trim();
    const queryOrg = String(req.nextUrl.searchParams.get("organizationId") ?? "").trim();
    const gate = await runSaasApiGate(req, "canGenerateQuote", {
      projectId,
      ...(queryOrg ? { organizationId: queryOrg } : {}),
    });
    organizationId = gate.organizationId;
    userId = gate.userId;
    traceId = gate.traceId;

    if (!projectId) {
      return NextResponse.json(
        { ok: false, message: "缺少 projectId", traceId: gate.traceId },
        { status: 400 },
      );
    }

    const quotes = await listQuotesForProject({
      projectId,
      organizationId: gate.organizationId,
    });

    return NextResponse.json({
      ok: true,
      quotes,
      latestQuoteId: quotes[0]?.id ?? null,
      traceId: gate.traceId,
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
        endpoint: "/api/quote/list",
        organizationId,
        userId,
      });
    }
    if (err instanceof Error && err.name === "SaasAuthError") {
      return saasGateErrorResponse(err, traceId);
    }
    console.error("[quote/list]", err);
    return NextResponse.json(
      {
        ok: false,
        message: err instanceof Error ? err.message : "方案历史加载失败",
        traceId,
      },
      { status: 500 },
    );
  }
}
