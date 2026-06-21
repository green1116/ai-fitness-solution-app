import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { runSalesAutomation } from "@/lib/sales/sales.service";
import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";

export async function POST(req: NextRequest) {
  let traceId = "unknown";
  try {
    const body = await req.json().catch(() => ({}));
    const gate = await runSaasOrgGate(req, "/api/sales/automate", body);
    traceId = gate.traceId;

    const customerId = String(body?.customerId ?? "").trim();
    if (!customerId) {
      return NextResponse.json({ ok: false, message: "customerId required", traceId }, { status: 400 });
    }

    const result = await runSalesAutomation({
      organizationId: gate.organizationId,
      customerId,
      leadId: body?.leadId,
      opportunityId: body?.opportunityId,
      companyName: body?.companyName,
      userId: gate.userId,
    });

    return NextResponse.json({ ok: true, ...result, traceId });
  } catch (err: unknown) {
    if (isKnownApiError(err)) return handleApiError(err, { traceId, endpoint: "/api/sales/automate" });
    if (err instanceof Error && err.name === "SaasAuthError") return saasGateErrorResponse(err, traceId);
    return NextResponse.json({ ok: false, message: "Sales automation failed", traceId }, { status: 500 });
  }
}
