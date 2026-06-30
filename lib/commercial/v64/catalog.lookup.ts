/**
 * V64 P5 — Product / plan catalog lookup
 */
import type { ProductTier } from "@/lib/productization/catalog";
import type { SaasPlan } from "@/lib/saas/types";

import { SAAS_TO_PRODUCT_TIER } from "./capability.map";
import { buildAllTierCatalogEntries } from "./catalog.builder";
import type { TierCatalogEntry } from "./catalog.types";
import { getPlanRegistryEntry } from "./plan.registry";

export type CatalogLookupKey =
  | { kind: "productTier"; tier: ProductTier }
  | { kind: "saasPlan"; plan: SaasPlan }
  | { kind: "planId"; planId: string };

export function lookupTierCatalogEntry(key: CatalogLookupKey): TierCatalogEntry | null {
  switch (key.kind) {
    case "productTier": {
      return (
        buildAllTierCatalogEntries().find((e) => e.productTier === key.tier) ?? null
      );
    }
    case "saasPlan": {
      const tier = SAAS_TO_PRODUCT_TIER[key.plan];
      return lookupTierCatalogEntry({ kind: "productTier", tier });
    }
    case "planId": {
      return (
        buildAllTierCatalogEntries().find(
          (e) => e.plan.planId === key.planId || e.plan.subscriptionPlanId === key.planId,
        ) ?? null
      );
    }
    default:
      return null;
  }
}

export function lookupTierCatalogByProductTier(tier: ProductTier): TierCatalogEntry {
  const entry = lookupTierCatalogEntry({ kind: "productTier", tier });
  if (!entry) {
    throw new Error(`Unknown catalog product tier: ${tier}`);
  }
  return entry;
}

export function lookupTierCatalogBySaasPlan(plan: SaasPlan): TierCatalogEntry {
  return lookupTierCatalogByProductTier(SAAS_TO_PRODUCT_TIER[plan]);
}

export function lookupTierCatalogByPlanId(planId: string): TierCatalogEntry | null {
  return lookupTierCatalogEntry({ kind: "planId", planId });
}

export function lookupProductCatalogByPlanRegistry(tier: ProductTier): TierCatalogEntry {
  getPlanRegistryEntry(tier);
  return lookupTierCatalogByProductTier(tier);
}

export function lookupAllTierCatalogEntries(): TierCatalogEntry[] {
  return buildAllTierCatalogEntries();
}
