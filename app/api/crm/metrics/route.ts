import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { aggregateCRMMetrics } from "@/lib/crm/crm.metrics";
import { describeSalesFunnel } from "@/lib/crm/pipeline/crm.pipeline.engine";
import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";

export async function GET(req: NextRequest) {
  let traceId = "unknown";
  try {
    const gate = await runSaasOrgGate(req, "/api/crm/metrics");
    traceId = gate.traceId;

    const metrics = await aggregateCRMMetrics(gate.organizationId);

    return NextResponse.json({
      ok: true,
      metrics,
      salesFunnel: describeSalesFunnel(),
      traceId,
    });
  } catch (err: unknown) {
    if (isKnownApiError(err)) return handleApiError(err, { traceId, endpoint: "/api/crm/metrics" });
    if (err instanceof Error && err.name === "SaasAuthError") return saasGateErrorResponse(err, traceId);
    return NextResponse.json({ ok: false, message: "Failed to load CRM metrics", traceId }, { status: 500 });
  }
}
