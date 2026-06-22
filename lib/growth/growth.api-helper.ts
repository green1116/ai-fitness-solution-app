/**
 * V60 P1 — Growth-aware API error responses (does not bypass feature gates)
 */

import { NextResponse } from "next/server";

import { FeatureGateError } from "@/lib/feature-flags/feature-gate";
import type { FeatureKey } from "@/lib/feature-flags/feature.service";
import { saasGateErrorResponse } from "@/lib/saas/api-gate";
import { recordFeatureGateBlocked } from "./growth.service";

export async function growthAwareGateErrorResponse(
  err: unknown,
  ctx?: {
    organizationId?: string;
    userId?: string;
    feature?: FeatureKey;
    traceId?: string;
  },
): Promise<NextResponse> {
  if (
    err instanceof FeatureGateError &&
    ctx?.organizationId &&
    ctx.feature
  ) {
    const paywall = await recordFeatureGateBlocked({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      feature: ctx.feature,
    });

    const base = saasGateErrorResponse(err, ctx.traceId);
    const payload = await base.json();

    return NextResponse.json(
      {
        ...payload,
        paywall: {
          showPaywall: paywall.showPaywall,
          reason: paywall.reason,
          currentPlan: paywall.currentPlan,
          recommendedPlan: paywall.recommendedPlan,
          trigger: paywall.trigger,
          usage: paywall.usage,
        },
      },
      { status: 403, headers: { "x-trace-id": ctx.traceId ?? payload.traceId ?? "unknown" } },
    );
  }

  return saasGateErrorResponse(err, ctx?.traceId);
}
