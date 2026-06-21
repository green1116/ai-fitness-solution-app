import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import {
  recommendNextAction,
  triggerQuoteRecommendation,
  triggerBudgetRecommendation,
  triggerTenderRecommendation,
} from "@/lib/sales/sales.service";
import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";

export async function GET(req: NextRequest) {
  let traceId = "unknown";
  try {
    const gate = await runSaasOrgGate(req, "/api/sales/recommendations");
    traceId = gate.traceId;

    const customerId = req.nextUrl.searchParams.get("customerId") ?? undefined;
    const companyName = req.nextUrl.searchParams.get("companyName") ?? undefined;

    const ctx = { organizationId: gate.organizationId, customerId, companyName };

    const nextAction = recommendNextAction(ctx);
    const quote = triggerQuoteRecommendation({ ...ctx, hasExistingQuote: false });
    const budget = triggerBudgetRecommendation({ ...ctx, quoteGenerated: true });
    const tender = triggerTenderRecommendation(ctx);

    return NextResponse.json({
      ok: true,
      nextAction,
      recommendations: [quote, budget, tender].filter(Boolean),
      traceId,
    });
  } catch (err: unknown) {
    if (isKnownApiError(err)) return handleApiError(err, { traceId, endpoint: "/api/sales/recommendations" });
    if (err instanceof Error && err.name === "SaasAuthError") return saasGateErrorResponse(err, traceId);
    return NextResponse.json({ ok: false, message: "Recommendations failed", traceId }, { status: 500 });
  }
}
