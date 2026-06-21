import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { listVerticalIndustries, scaleProductAcrossIndustries } from "@/lib/expansion/expansion.service";
import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";

export async function GET(req: NextRequest) {
  let traceId = "unknown";
  try {
    const gate = await runSaasOrgGate(req, "/api/expansion/verticals");
    traceId = gate.traceId;

    const scaled = req.nextUrl.searchParams.get("scaled") === "1";

    return NextResponse.json({
      ok: true,
      verticals: listVerticalIndustries(),
      scaled: scaled ? scaleProductAcrossIndustries() : undefined,
      traceId,
    });
  } catch (err: unknown) {
    if (isKnownApiError(err)) return handleApiError(err, { traceId, endpoint: "/api/expansion/verticals" });
    if (err instanceof Error && err.name === "SaasAuthError") return saasGateErrorResponse(err, traceId);
    return NextResponse.json({ ok: false, message: "Failed to list verticals", traceId }, { status: 500 });
  }
}
