/**
 * V64 P3 — Plan → feature mapping
 */
import { getFeatureIdsForTier, getFeaturesForTier } from "@/lib/productization/catalog";
import type { ProductTier } from "@/lib/productization/catalog";
import type { SaasPlan } from "@/lib/saas/types";

import {
  featureKeysForSaasPlan,
  PRODUCT_TO_SAAS_PLAN,
  resolveProductTierForSaasPlan,
} from "./capability.map";
import { buildPlanRegistry } from "./plan.registry";
import type { PlanFeatureMapping } from "./feature.types";

const ALL_TIERS: ProductTier[] = ["starter", "professional", "enterprise"];

export function buildPlanFeatureMapping(productTier: ProductTier): PlanFeatureMapping {
  const saasPlan = PRODUCT_TO_SAAS_PLAN[productTier];
  const registry = buildPlanRegistry().plans.find((p) => p.productTier === productTier);
  const features = getFeaturesForTier(productTier);
  return {
    planId: registry?.planId ?? `plan-${productTier}`,
    productTier,
    saasPlan,
    productName: registry?.productName ?? productTier,
    featureIds: getFeatureIdsForTier(productTier),
    featureKeys: features.map((f) => f.key),
    runtimeFeatureFlags: featureKeysForSaasPlan(saasPlan),
  };
}

export function buildPlanFeatureMappings(input?: {
  deploymentId?: string;
}): PlanFeatureMapping[] {
  void input?.deploymentId;
  return ALL_TIERS.map(buildPlanFeatureMapping);
}

export function lookupPlanFeatureMappingBySaasPlan(plan: SaasPlan): PlanFeatureMapping {
  return buildPlanFeatureMapping(resolveProductTierForSaasPlan(plan));
}

export function lookupPlanFeatureMappingByProductTier(tier: ProductTier): PlanFeatureMapping {
  return buildPlanFeatureMapping(tier);
}
