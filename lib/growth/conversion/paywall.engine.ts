/**
 * V60 P1 — Paywall engine (Feature Gate + Subscription + Usage — read-only)
 */

import { checkFeatureAccess } from "@/lib/feature-flags/feature-gate";
import type { FeatureKey } from "@/lib/feature-flags/feature.service";
import { getActiveSubscription } from "@/lib/billing/subscription.service";
import { getUsageCountInPeriod } from "@/lib/usage/usage-aggregator.service";
import { PLAN_USAGE_LIMITS, FEATURE_TO_USAGE, resolveFeatureFlags } from "@/lib/feature-flags/feature.service";
import type { SaasPlan } from "@/lib/saas/types";
import { trackPaywallShown } from "../analytics.events";

export type ConversionTrigger =
  | "quote_generation_success"
  | "budget_export_click"
  | "tender_generation_click"
  | "pdf_download_attempt"
  | "api_usage_exceeded"
  | "budget_feature_blocked"
  | "tender_feature_blocked"
  | "quote_usage_limit";

export type PaywallDecision = {
  showPaywall: boolean;
  reason?: string;
  currentPlan: SaasPlan;
  recommendedPlan: SaasPlan;
  feature: FeatureKey;
  trigger: ConversionTrigger;
  usage?: { used: number; limit: number };
};

const FEATURE_UPGRADE_MAP: Partial<Record<FeatureKey, SaasPlan>> = {
  canGenerateBudget: "PRO",
  canExportPDF: "PRO",
  canGenerateTender: "ENTERPRISE",
  canUseAPI: "ENTERPRISE",
};

const TRIGGER_FEATURE_MAP: Record<ConversionTrigger, FeatureKey> = {
  quote_generation_success: "canGenerateQuote",
  budget_export_click: "canGenerateBudget",
  tender_generation_click: "canGenerateTender",
  pdf_download_attempt: "canExportPDF",
  api_usage_exceeded: "canUseAPI",
  budget_feature_blocked: "canGenerateBudget",
  tender_feature_blocked: "canGenerateTender",
  quote_usage_limit: "canGenerateQuote",
};

export async function evaluatePaywall(input: {
  organizationId: string;
  trigger: ConversionTrigger;
  userId?: string;
}): Promise<PaywallDecision> {
  const feature = TRIGGER_FEATURE_MAP[input.trigger];
  const access = await checkFeatureAccess(input.organizationId, feature);
  const recommendedPlan = FEATURE_UPGRADE_MAP[feature] ?? "PRO";

  let usage: PaywallDecision["usage"];
  const usageKey = FEATURE_TO_USAGE[feature];
  if (usageKey && access.plan) {
    const limit = PLAN_USAGE_LIMITS[access.plan][usageKey];
    if (limit >= 0) {
      const used = await getUsageCountInPeriod(input.organizationId, usageKey);
      usage = { used, limit };
    }
  }

  const showPaywall = !access.allowed;

  if (showPaywall) {
    trackPaywallShown({
      userId: input.userId,
      organizationId: input.organizationId,
      feature,
      trigger: input.trigger,
      currentPlan: access.plan,
    });
  }

  return {
    showPaywall,
    reason: access.reason,
    currentPlan: access.plan,
    recommendedPlan,
    feature,
    trigger: input.trigger,
    usage,
  };
}

export async function resolvePaywallForFeatureGateError(input: {
  organizationId: string;
  feature: FeatureKey;
  userId?: string;
  message?: string;
}): Promise<PaywallDecision> {
  const trigger = featureToTrigger(input.feature);
  return evaluatePaywall({
    organizationId: input.organizationId,
    trigger,
    userId: input.userId,
  });
}

function featureToTrigger(feature: FeatureKey): ConversionTrigger {
  if (feature === "canGenerateBudget") return "budget_feature_blocked";
  if (feature === "canGenerateTender") return "tender_feature_blocked";
  if (feature === "canExportPDF") return "pdf_download_attempt";
  if (feature === "canUseAPI") return "api_usage_exceeded";
  return "quote_usage_limit";
}

export async function getSubscriptionPaywallContext(organizationId: string) {
  const sub = await getActiveSubscription(organizationId);
  const plan = (sub?.plan?.toUpperCase() ?? "BASIC") as SaasPlan;
  return {
    plan,
    status: sub?.status ?? "NONE",
    flags: resolveFeatureFlags(plan),
  };
}
