/**
 * V59.4 — Subscription resolver + plan → feature flags
 */

import {
  PLAN_FEATURE_MATRIX,
  resolveFeatureFlags,
  type FeatureFlags,
} from "@/lib/feature-flags/feature.service";
import { prisma } from "@/lib/prisma";
import type { SaasPlan, SaasSubStatus, SubscriptionRecord } from "@/lib/saas/types";

export function mapStripePlanToFeatureFlags(plan: SaasPlan): FeatureFlags {
  return resolveFeatureFlags(plan);
}

export function getPlanFeatureMatrix(): typeof PLAN_FEATURE_MATRIX {
  return PLAN_FEATURE_MATRIX;
}

export async function getActiveSubscriptionForOrganization(organizationId: string) {
  return prisma.subscription.findFirst({
    where: { organizationId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });
}

export async function findSubscriptionByStripeCustomerId(stripeCustomerId: string) {
  return prisma.subscription.findFirst({
    where: { stripeCustomerId },
  });
}

export async function findSubscriptionByStripeSubscriptionId(stripeSubscriptionId: string) {
  return prisma.subscription.findFirst({
    where: { stripeSubscriptionId },
  });
}

export async function resolveOrganizationFeatures(
  organizationId: string,
): Promise<{ plan: SaasPlan; status: SaasSubStatus; flags: FeatureFlags }> {
  const sub = await getActiveSubscriptionForOrganization(organizationId);
  const plan = (sub?.plan ?? "BASIC") as SaasPlan;
  const status = (sub?.status ?? "ACTIVE") as SaasSubStatus;
  return { plan, status, flags: mapStripePlanToFeatureFlags(plan) };
}

export type { SubscriptionRecord };
