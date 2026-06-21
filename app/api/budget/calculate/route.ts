import { NextRequest, NextResponse } from "next/server";

import { FeatureGateError } from "@/lib/feature-flags/feature-gate";
import { trackBudgetCalculated } from "@/lib/growth/analytics.events";
import { growthAwareGateErrorResponse } from "@/lib/growth/growth.api-helper";
import { recordBudgetAsOpportunity } from "@/lib/crm/crm.product-bridge";
import { onBudgetCalculated } from "@/lib/sales/sales.product-bridge";
import { runSaasApiGate, saasGateErrorResponse, trackFeatureUsage } from "@/lib/saas/api-gate";
import { calculateBudget } from "@/lib/services/budget.service";

export async function POST(req: NextRequest) {
  let organizationId: string | undefined;
  let userId: string | undefined;
  let traceId: string | undefined;

  try {
    const body = await req.json();
    const gate = await runSaasApiGate(req, "canGenerateBudget", body);
    organizationId = gate.organizationId;
    userId = gate.userId;
    traceId = gate.traceId;

    const quoteId = String(body?.quoteId ?? "").trim();
    const companySize = Number(body?.companySize ?? 0);
    const budgetTier = body?.budgetTier as "low" | "mid" | "high" | undefined;

    if (!quoteId || !companySize) {
      return NextResponse.json(
        { ok: false, message: "缺少 quoteId 或 companySize", traceId: gate.traceId },
        { status: 400 },
      );
    }

    const result = await calculateBudget({ quoteId, companySize, budgetTier });

    await trackFeatureUsage(gate.organizationId, "canGenerateBudget");
    trackBudgetCalculated({ userId: gate.userId, organizationId: gate.organizationId, quoteId });

    void recordBudgetAsOpportunity({
      organizationId: gate.organizationId,
      companyName: String(body?.companyName ?? "Budget Customer"),
      userId: gate.userId,
      quoteId,
      budgetId: result.budget.id,
      estimatedValue: companySize * 100,
    }).then((crm) => {
      void onBudgetCalculated({
        organizationId: gate.organizationId,
        customerId: crm?.customer?.id,
        userId: gate.userId,
        exported: Boolean(body?.exported),
        leadId: undefined,
        opportunityId: crm?.opportunity?.id,
      });
    });

    return NextResponse.json({
      ok: true,
      budgetId: result.budget.id,
      structure: result.engine.structure,
      syncedStatus: result.engine.syncedStatus,
      plan: gate.feature.plan,
      traceId: gate.traceId,
    });
  } catch (err: unknown) {
    if (err instanceof FeatureGateError) {
      return growthAwareGateErrorResponse(err, {
        organizationId,
        userId,
        feature: "canGenerateBudget",
        traceId,
      });
    }
    if (err instanceof Error && err.name === "SaasAuthError") {
      return saasGateErrorResponse(err, traceId);
    }
    console.error("[budget/calculate]", err);
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "预算计算失败", traceId },
      { status: 500 },
    );
  }
}
