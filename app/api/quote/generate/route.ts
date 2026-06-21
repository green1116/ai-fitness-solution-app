import { NextRequest, NextResponse } from "next/server";

import { FeatureGateError } from "@/lib/feature-flags/feature-gate";
import { growthAwareGateErrorResponse } from "@/lib/growth/growth.api-helper";
import { hasFirstQuote } from "@/lib/growth/activation/first-action.tracker";
import { recordQuoteGenerationSuccess } from "@/lib/growth/growth.service";
import { recordQuoteAsLead } from "@/lib/crm/crm.product-bridge";
import { onQuoteGenerated } from "@/lib/sales/sales.product-bridge";
import { runSaasApiGate, saasGateErrorResponse, trackFeatureUsage } from "@/lib/saas/api-gate";
import { generateQuote } from "@/lib/services/quote.service";

export async function POST(req: NextRequest) {
  let organizationId: string | undefined;
  let userId: string | undefined;
  let traceId: string | undefined;

  try {
    const body = await req.json();
    const gate = await runSaasApiGate(req, "canGenerateQuote", body);
    organizationId = gate.organizationId;
    userId = gate.userId;
    traceId = gate.traceId;

    const projectId = String(body?.projectId ?? "").trim();
    const workspaceId = String(body?.workspaceId ?? gate.organizationId).trim();
    const companyName = String(body?.companyInfo?.companyName ?? body?.companyName ?? "").trim();

    if (!projectId || !companyName) {
      return NextResponse.json(
        { ok: false, message: "缺少 projectId 或 companyName", traceId: gate.traceId },
        { status: 400 },
      );
    }

    const isFirst = !hasFirstQuote(gate.organizationId);

    const result = await generateQuote({
      projectId,
      workspaceId,
      organizationId: gate.organizationId,
      companyInfo: {
        companyName,
        industry: body?.industry ?? body?.companyInfo?.industry,
        city: body?.city ?? body?.companyInfo?.city,
        targetUsers: body?.targetUsers ?? body?.companyInfo?.targetUsers,
        areaM2: body?.areaM2 ?? body?.companyInfo?.areaM2,
        notes: body?.notes ?? body?.companyInfo?.notes,
      },
    });

    await trackFeatureUsage(gate.organizationId, "canGenerateQuote");
    await recordQuoteGenerationSuccess({
      userId: gate.userId,
      organizationId: gate.organizationId,
      projectId,
      isFirst,
    });

    void recordQuoteAsLead({
      organizationId: gate.organizationId,
      companyName,
      industry: body?.industry ?? body?.companyInfo?.industry,
      userId: gate.userId,
      quoteId: result.quote.id,
      projectId,
    }).then((crm) => {
      void onQuoteGenerated({
        organizationId: gate.organizationId,
        customerId: crm?.customer?.id,
        userId: gate.userId,
        quoteId: result.quote.id,
        companyName,
        isRepeat: !isFirst,
        leadId: crm?.lead?.id,
      });
    });

    return NextResponse.json({
      ok: true,
      quoteId: result.quote.id,
      status: result.quote.status,
      proposal: result.engine.proposal,
      orchestrationId: result.engine.runtime.orchestrationId,
      plan: gate.feature.plan,
      traceId: gate.traceId,
      growth: { isFirstQuote: isFirst },
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
    if (err instanceof Error && err.name === "SaasAuthError") {
      return saasGateErrorResponse(err, traceId);
    }
    console.error("[quote/generate]", err);
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "方案生成失败", traceId },
      { status: 500 },
    );
  }
}
