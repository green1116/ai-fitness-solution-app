/**
 * V59 SaaS — Feature gate + subscription validation
 */

import { getActiveSubscription } from "@/lib/billing/subscription.service";
import {
  FEATURE_TO_USAGE,
  resolveFeatureFlags,
  resolveUsageLimit,
  type FeatureFlags,
  type FeatureKey,
} from "@/lib/feature-flags/feature.service";
import { normalizeSaasPlan } from "@/lib/saas/plan.compat";
import type { SaasPlan, UsageType } from "@/lib/saas/types";
import { getUsageCountInPeriod } from "@/lib/usage/usage-aggregator.service";

export type FeatureAccessResult = {
  allowed: boolean;
  reason?: string;
  plan: SaasPlan;
  flags: FeatureFlags;
};

export async function checkFeatureAccess(
  organizationId: string,
  feature: FeatureKey,
): Promise<FeatureAccessResult> {
  const subscription = await getActiveSubscription(organizationId);
  if (!subscription || subscription.status !== "ACTIVE") {
    return {
      allowed: false,
      reason: "No active subscription",
      plan: "BASIC",
      flags: resolveFeatureFlags("BASIC"),
    };
  }

  const plan = normalizeSaasPlan(subscription.plan);
  const flags = resolveFeatureFlags(plan);

  if (!flags[feature]) {
    return {
      allowed: false,
      reason: `Feature ${feature} not included in ${plan} plan`,
      plan,
      flags,
    };
  }

  const usageKey = FEATURE_TO_USAGE[feature];
  if (usageKey) {
    const limit = resolveUsageLimit(plan, usageKey);
    if (limit >= 0) {
      const used = await getUsageCountInPeriod(organizationId, usageKey as UsageType);
      if (used >= limit) {
        return {
          allowed: false,
          reason: `Usage limit reached for ${usageKey} (${used}/${limit})`,
          plan,
          flags,
        };
      }
    }
  }

  return { allowed: true, plan, flags };
}

export class FeatureGateError extends Error {
  readonly code = "FEATURE_GATE_DENIED" as const;
  constructor(message: string) {
    super(message);
    this.name = "FeatureGateError";
  }
}

export async function enforceFeatureAccess(
  organizationId: string,
  feature: FeatureKey,
): Promise<FeatureAccessResult> {
  const result = await checkFeatureAccess(organizationId, feature);
  if (!result.allowed) {
    throw new FeatureGateError(result.reason ?? "Feature access denied");
  }
  return result;
}
