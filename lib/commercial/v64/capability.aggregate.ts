/**
 * V64 P4 — Tier capability aggregation (product / SaaS / user)
 */
import { PLAN_USAGE_LIMITS } from "@/lib/feature-flags/feature.service";
import type { ProductTier } from "@/lib/productization/catalog";
import type { SaasPlan } from "@/lib/saas/types";
import type { UserTier } from "@/lib/commercial/userTier";

import {
  PRODUCT_TO_SAAS_PLAN,
  PRODUCT_TO_USER_TIER,
  featureKeysForSaasPlan,
  resolveProductTierForSaasPlan,
  USER_TO_PRODUCT_TIER,
} from "./capability.map";
import { buildExposedCapabilities } from "./feature.exposure";
import { getPlanRegistryEntry } from "./plan.registry";
import type { TierCapabilityAggregate } from "./capability.types";

const ALL_PRODUCT_TIERS: ProductTier[] = ["starter", "professional", "enterprise"];

export function buildTierCapabilityAggregate(productTier: ProductTier): TierCapabilityAggregate {
  const saasPlan = PRODUCT_TO_SAAS_PLAN[productTier];
  const userTier = PRODUCT_TO_USER_TIER[productTier];
  const plan = getPlanRegistryEntry(productTier);
  const allExposed = buildExposedCapabilities();
  const enabledCapabilities = allExposed.filter((cap) => cap.enabledByTier[productTier]);

  return {
    productTier,
    saasPlan,
    userTier,
    planId: plan.planId,
    productName: plan.productName,
    featureFlags: featureKeysForSaasPlan(saasPlan),
    usageLimits: { ...PLAN_USAGE_LIMITS[saasPlan] },
    enabledCapabilities,
    enabledCapabilityCount: enabledCapabilities.length,
  };
}

export function buildAllTierCapabilityAggregates(): TierCapabilityAggregate[] {
  return ALL_PRODUCT_TIERS.map(buildTierCapabilityAggregate);
}

export function aggregateCapabilityForSaasPlan(plan: SaasPlan): TierCapabilityAggregate {
  return buildTierCapabilityAggregate(resolveProductTierForSaasPlan(plan));
}

export function aggregateCapabilityForUserTier(tier: UserTier): TierCapabilityAggregate | null {
  const productTier = USER_TO_PRODUCT_TIER[tier];
  if (!productTier) return null;
  return buildTierCapabilityAggregate(productTier);
}
