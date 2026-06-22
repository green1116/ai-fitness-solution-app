/**
 * V60 P1 — Reactivation engine
 */

import { appendGrowthEvent } from "../growth.events.store";
import { predictChurn, type ChurnRisk } from "./churn.predictor";
import { getPricingTier } from "../conversion/pricing.strategy";
import type { SaasPlan } from "@/lib/saas/types";

export type ReactivationCampaign = {
  organizationId: string;
  churnRisk: ChurnRisk;
  message: string;
  recommendedPlan: SaasPlan;
  cta: string;
};

export function buildReactivationCampaign(organizationId: string, currentPlan: SaasPlan = "BASIC"): ReactivationCampaign {
  const prediction = predictChurn(organizationId);
  const recommendedPlan: SaasPlan = prediction.churnRisk === "high" ? "PRO" : currentPlan;
  const tier = getPricingTier(recommendedPlan);

  return {
    organizationId,
    churnRisk: prediction.churnRisk,
    message:
      prediction.churnRisk === "high"
        ? "We noticed reduced activity — unlock more value with an upgrade."
        : "Welcome back — continue building your fitness solution proposals.",
    recommendedPlan,
    cta: tier.cta,
  };
}

export function trackReactivationSent(input: {
  organizationId: string;
  campaignType: string;
  churnRisk: ChurnRisk;
}) {
  appendGrowthEvent({
    event: "session.return",
    organizationId: input.organizationId,
    meta: { reactivation: true, campaignType: input.campaignType, churnRisk: input.churnRisk },
  });
}

export function listOrganizationsNeedingReactivation(orgIds: string[]): string[] {
  return orgIds.filter((id) => predictChurn(id).churnRisk !== "low");
}
