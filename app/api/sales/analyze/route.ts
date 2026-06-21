import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { generateSalesSuggestion, analyzeLeadIntent, scoreLeadQuality } from "@/lib/sales/sales.service";
import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";

export async function POST(req: NextRequest) {
  let traceId = "unknown";
  try {
    const body = await req.json().catch(() => ({}));
    const gate = await runSaasOrgGate(req, "/api/sales/analyze", body);
    traceId = gate.traceId;

    const customerId = body?.customerId ? String(body.customerId) : undefined;

    const intent = analyzeLeadIntent({
      organizationId: gate.organizationId,
      customerId,
      leadScore: body?.leadScore ? Number(body.leadScore) : undefined,
    });

    const quality = scoreLeadQuality({
      organizationId: gate.organizationId,
      customerId,
      source: body?.source,
      hasQuote: Boolean(body?.hasQuote),
    });

    const suggestion = generateSalesSuggestion({
      organizationId: gate.organizationId,
      customerId,
      companyName: body?.companyName,
      leadScore: quality.score,
    });

    return NextResponse.json({ ok: true, intent, quality, suggestion, traceId });
  } catch (err: unknown) {
    if (isKnownApiError(err)) return handleApiError(err, { traceId, endpoint: "/api/sales/analyze" });
    if (err instanceof Error && err.name === "SaasAuthError") return saasGateErrorResponse(err, traceId);
    return NextResponse.json({ ok: false, message: "Sales analysis failed", traceId }, { status: 500 });
  }
}
