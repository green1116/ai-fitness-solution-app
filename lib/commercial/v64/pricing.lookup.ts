/**
 * V64 P2 — Pricing lookup (by product / SaaS / user tier)
 */
import type { ProductTier } from "@/lib/productization/catalog";
import type { SaasPlan } from "@/lib/saas/types";
import type { UserTier } from "@/lib/commercial/userTier";

import {
  normalizeAllPlanPrices,
  normalizePlanPrice,
  normalizePlanPriceForSaasPlan,
  normalizePlanPriceForUserTier,
} from "./pricing.normalize";
import type { NormalizedPlanPrice } from "./pricing.types";

export type PricingLookupKey =
  | { kind: "productTier"; tier: ProductTier }
  | { kind: "saasPlan"; plan: SaasPlan }
  | { kind: "userTier"; tier: UserTier };

export function lookupPlanPrice(key: PricingLookupKey): NormalizedPlanPrice | null {
  switch (key.kind) {
    case "productTier":
      return normalizePlanPrice(key.tier);
    case "saasPlan":
      return normalizePlanPriceForSaasPlan(key.plan);
    case "userTier":
      return normalizePlanPriceForUserTier(key.tier);
    default:
      return null;
  }
}

export function lookupPlanPriceByProductTier(tier: ProductTier): NormalizedPlanPrice {
  return normalizePlanPrice(tier);
}

export function lookupPlanPriceBySaasPlan(plan: SaasPlan): NormalizedPlanPrice {
  return normalizePlanPriceForSaasPlan(plan);
}

export function lookupPlanPriceByUserTier(tier: UserTier): NormalizedPlanPrice | null {
  return normalizePlanPriceForUserTier(tier);
}

export function lookupAllPlanPrices(): NormalizedPlanPrice[] {
  return normalizeAllPlanPrices();
}
