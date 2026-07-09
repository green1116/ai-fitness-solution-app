import { NextRequest, NextResponse } from "next/server";

import { FeatureGateError } from "@/lib/feature-flags/feature-gate";
import { trackTenderGenerated } from "@/lib/growth/analytics.events";
import { growthAwareGateErrorResponse } from "@/lib/growth/growth.api-helper";
import { recordTenderAsDeal } from "@/lib/crm/crm.product-bridge";
import { onTenderGenerated } from "@/lib/sales/sales.product-bridge";
import { runSaasApiGate, saasGateErrorResponse, trackFeatureUsage } from "@/lib/saas/api-gate";
import { generateTender, resolveTenderInput } from "@/lib/services/tender.service";
import { ensureProjectOrganizationId } from "@/lib/services/project.service";

export async function POST(req: NextRequest) {
  let organizationId: string | undefined;
  let userId: string | undefined;
  let traceId: string | undefined;

  try {
    const body = await req.json();
    const gate = await runSaasApiGate(req, "canGenerateTender", body);
    organizationId = gate.organizationId;
    userId = gate.userId;
    traceId = gate.traceId;

    const projectId = String(body?.projectId ?? "").trim();
    const quoteIdInput = String(body?.quoteId ?? "").trim();
    const budgetIdInput = body?.budgetId ? String(body.budgetId).trim() : undefined;

    if (!projectId) {
      return NextResponse.json(
        { ok: false, message: "缺少 projectId", traceId: gate.traceId },
        { status: 400 },
      );
    }

    const resolved = await resolveTenderInput({
      organizationId: gate.organizationId,
      projectId,
      quoteId: quoteIdInput || undefined,
      budgetId: budgetIdInput,
    });

    const result = await generateTender(resolved);
    await ensureProjectOrganizationId(resolved.projectId, gate.organizationId);

    await trackFeatureUsage(gate.organizationId, "canGenerateTender");
    trackTenderGenerated({ userId: gate.userId, organizationId: gate.organizationId, projectId });

    void recordTenderAsDeal({
      organizationId: gate.organizationId,
      companyName: String(body?.companyName ?? "Tender Customer"),
      userId: gate.userId,
      tenderId: result.tender.id,
      estimatedValue: 15000,
    }).then((crm) => {
      void onTenderGenerated({
        organizationId: gate.organizationId,
        customerId: crm?.customer?.id,
        userId: gate.userId,
        tenderId: result.tender.id,
        dealId: crm?.deal?.id,
        opportunityId: crm?.opportunity?.id,
      });
    });

    return NextResponse.json({
      ok: true,
      tenderId: result.tender.id,
      status: result.tender.status,
      fileName: result.tender.fileName,
      fileUrl: result.tender.fileUrl,
      metadata: result.engine.artifact.metadata,
      plan: gate.feature.plan,
      traceId: gate.traceId,
    });
  } catch (err: unknown) {
    if (err instanceof FeatureGateError) {
      return growthAwareGateErrorResponse(err, {
        organizationId,
        userId,
        feature: "canGenerateTender",
        traceId,
      });
    }
    if (err instanceof Error && err.name === "SaasAuthError") {
      return saasGateErrorResponse(err, traceId);
    }
    console.error("[tender/generate]", err);
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "标书生成失败", traceId },
      { status: 500 },
    );
  }
}
