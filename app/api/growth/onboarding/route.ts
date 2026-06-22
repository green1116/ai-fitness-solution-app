import { NextRequest, NextResponse } from "next/server";

import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";
import { resolveOnboardingProgress, getOnboardingFlow } from "@/lib/growth/activation/onboarding.flow";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { handleApiError } from "@/lib/error/global-error.handler";

export async function GET(req: NextRequest) {
  let traceId = "unknown";
  try {
    const gate = await runSaasOrgGate(req, "/api/growth/onboarding");
    traceId = gate.traceId;
    const progress = resolveOnboardingProgress(gate.userId);

    return NextResponse.json({
      ok: true,
      traceId,
      flow: getOnboardingFlow(),
      progress: {
        ...progress,
        organizationId: progress.organizationId ?? gate.organizationId,
      },
    });
  } catch (err: unknown) {
    if (isKnownApiError(err)) {
      return handleApiError(err, { traceId, endpoint: "/api/growth/onboarding" });
    }
    if (err instanceof Error && err.name === "SaasAuthError") {
      return saasGateErrorResponse(err, traceId);
    }
    return NextResponse.json({ ok: false, message: "Onboarding fetch failed", traceId }, { status: 500 });
  }
}
