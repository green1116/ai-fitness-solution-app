/**
 * V59.4 — Subscription resolver + plan → feature flags
 */

import {
  PLAN_FEATURE_MATRIX,
  resolveFeatureFlags,
  type FeatureFlags,
} from "@/lib/feature-flags/feature.service";
import { saasDb, type SaasPlan, type SaasSubStatus, type SubscriptionRecord } from "@/lib/saas/types";

export function mapStripePlanToFeatureFlags(plan: SaasPlan): FeatureFlags {
  return resolveFeatureFlags(plan);
}

export function getPlanFeatureMatrix(): typeof PLAN_FEATURE_MATRIX {
  return PLAN_FEATURE_MATRIX;
}

export async function getActiveSubscriptionForOrganization(organizationId: string) {
  return saasDb().subscription.findFirst({
    where: { organizationId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });
}

export async function findSubscriptionByStripeCustomerId(stripeCustomerId: string) {
  return saasDb().subscription.findByStripeCustomerId(stripeCustomerId);
}

export async function findSubscriptionByStripeSubscriptionId(stripeSubscriptionId: string) {
  return saasDb().subscription.findByStripeSubscriptionId(stripeSubscriptionId);
}

export async function resolveOrganizationFeatures(
  organizationId: string,
): Promise<{ plan: SaasPlan; status: SaasSubStatus; flags: FeatureFlags }> {
  const sub = await getActiveSubscriptionForOrganization(organizationId);
  const plan = sub?.plan ?? "BASIC";
  const status = sub?.status ?? "ACTIVE";
  return { plan, status, flags: mapStripePlanToFeatureFlags(plan) };
}

export type { SubscriptionRecord };
