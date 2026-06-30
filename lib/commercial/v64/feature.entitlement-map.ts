/**
 * V64 P3 — Tier → entitlement mapping
 */
import { getFeaturesForTier } from "@/lib/productization/catalog";
import type { ProductTier } from "@/lib/productization/catalog";
import { buildEntitlementForTier } from "@/lib/productization/billing/entitlements";
import { PLAN_USAGE_LIMITS } from "@/lib/feature-flags/feature.service";

import { PRODUCT_TO_SAAS_PLAN } from "./capability.map";
import type { TierEntitlementMapping } from "./feature.types";

const ALL_TIERS: ProductTier[] = ["starter", "professional", "enterprise"];

export function buildTierEntitlementMapping(productTier: ProductTier): TierEntitlementMapping {
  const saasPlan = PRODUCT_TO_SAAS_PLAN[productTier];
  return {
    productTier,
    saasPlan,
    entitlementId: `billing-entitlement-${productTier}`,
    billingEntitlement: buildEntitlementForTier(productTier),
    catalogFeatures: getFeaturesForTier(productTier),
    usageLimits: { ...PLAN_USAGE_LIMITS[saasPlan] },
  };
}

export function buildTierEntitlementMappings(): TierEntitlementMapping[] {
  return ALL_TIERS.map(buildTierEntitlementMapping);
}

export function lookupTierEntitlementMapping(tier: ProductTier): TierEntitlementMapping {
  return buildTierEntitlementMapping(tier);
}
