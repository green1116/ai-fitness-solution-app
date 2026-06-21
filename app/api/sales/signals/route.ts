import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { getSignalSummary } from "@/lib/sales/sales.service";
import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";

export async function GET(req: NextRequest) {
  let traceId = "unknown";
  try {
    const gate = await runSaasOrgGate(req, "/api/sales/signals");
    traceId = gate.traceId;

    const customerId = req.nextUrl.searchParams.get("customerId") ?? undefined;
    const signals = getSignalSummary(gate.organizationId, customerId);

    return NextResponse.json({ ok: true, signals, traceId });
  } catch (err: unknown) {
    if (isKnownApiError(err)) return handleApiError(err, { traceId, endpoint: "/api/sales/signals" });
    if (err instanceof Error && err.name === "SaasAuthError") return saasGateErrorResponse(err, traceId);
    return NextResponse.json({ ok: false, message: "Signals fetch failed", traceId }, { status: 500 });
  }
}
