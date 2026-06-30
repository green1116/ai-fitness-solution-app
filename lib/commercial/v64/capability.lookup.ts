/**
 * V64 P4 — Unified commercial capability lookup
 */
import type { ProductTier } from "@/lib/productization/catalog";
import type { SaasPlan } from "@/lib/saas/types";
import type { UserTier } from "@/lib/commercial/userTier";

import {
  aggregateCapabilityForSaasPlan,
  aggregateCapabilityForUserTier,
  buildAllTierCapabilityAggregates,
  buildTierCapabilityAggregate,
} from "./capability.aggregate";
import type { TierCapabilityAggregate } from "./capability.types";

export type CapabilityLookupKey =
  | { kind: "productTier"; tier: ProductTier }
  | { kind: "saasPlan"; plan: SaasPlan }
  | { kind: "userTier"; tier: UserTier };

export function lookupCommercialCapability(
  key: CapabilityLookupKey,
): TierCapabilityAggregate | null {
  switch (key.kind) {
    case "productTier":
      return buildTierCapabilityAggregate(key.tier);
    case "saasPlan":
      return aggregateCapabilityForSaasPlan(key.plan);
    case "userTier":
      return aggregateCapabilityForUserTier(key.tier);
    default:
      return null;
  }
}

export function lookupCommercialCapabilityByProductTier(
  tier: ProductTier,
): TierCapabilityAggregate {
  return buildTierCapabilityAggregate(tier);
}

export function lookupCommercialCapabilityBySaasPlan(
  plan: SaasPlan,
): TierCapabilityAggregate {
  return aggregateCapabilityForSaasPlan(plan);
}

export function lookupCommercialCapabilityByUserTier(
  tier: UserTier,
): TierCapabilityAggregate | null {
  return aggregateCapabilityForUserTier(tier);
}

export function lookupAllCommercialCapabilities(): TierCapabilityAggregate[] {
  return buildAllTierCapabilityAggregates();
}
