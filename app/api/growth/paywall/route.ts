import { NextRequest, NextResponse } from "next/server";

import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";
import { recordPaywallCheck } from "@/lib/growth/growth.service";
import { getPricingTier } from "@/lib/growth/conversion/pricing.strategy";
import type { ConversionTrigger } from "@/lib/growth/conversion/paywall.engine";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { handleApiError } from "@/lib/error/global-error.handler";

const VALID_TRIGGERS = new Set<string>([
  "quote_generation_success",
  "budget_export_click",
  "tender_generation_click",
  "pdf_download_attempt",
  "api_usage_exceeded",
  "budget_feature_blocked",
  "tender_feature_blocked",
  "quote_usage_limit",
]);

export async function POST(req: NextRequest) {
  let traceId = "unknown";
  try {
    const body = await req.json().catch(() => ({}));
    const gate = await runSaasOrgGate(req, "/api/growth/paywall", body);
    traceId = gate.traceId;

    const trigger = String(body?.trigger ?? "budget_feature_blocked");
    if (!VALID_TRIGGERS.has(trigger)) {
      return NextResponse.json({ ok: false, message: "Invalid paywall trigger", traceId }, { status: 400 });
    }

    const decision = await recordPaywallCheck({
      organizationId: gate.organizationId,
      userId: gate.userId,
      trigger: trigger as ConversionTrigger,
    });

    const recommendedTier = getPricingTier(decision.recommendedPlan);

    return NextResponse.json({
      ok: true,
      traceId,
      paywall: decision,
      pricing: recommendedTier,
    });
  } catch (err: unknown) {
    if (isKnownApiError(err)) {
      return handleApiError(err, { traceId, endpoint: "/api/growth/paywall" });
    }
    if (err instanceof Error && err.name === "SaasAuthError") {
      return saasGateErrorResponse(err, traceId);
    }
    return NextResponse.json({ ok: false, message: "Paywall evaluation failed", traceId }, { status: 500 });
  }
}
