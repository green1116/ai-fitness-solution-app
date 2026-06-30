/**
 * V64 P6 — Tier rank ordering (commercial metadata only)
 */
import type { ProductTier } from "@/lib/productization/catalog";
import type { SaasPlan } from "@/lib/saas/types";

import { PRODUCT_TO_SAAS_PLAN, SAAS_TO_PRODUCT_TIER } from "./capability.map";

export const PRODUCT_TIER_RANK: Record<ProductTier, number> = {
  starter: 0,
  professional: 1,
  enterprise: 2,
};

export const SAAS_PLAN_RANK: Record<SaasPlan, number> = {
  BASIC: PRODUCT_TIER_RANK.starter,
  PRO: PRODUCT_TIER_RANK.professional,
  ENTERPRISE: PRODUCT_TIER_RANK.enterprise,
};

export function compareProductTiers(from: ProductTier, to: ProductTier): number {
  return PRODUCT_TIER_RANK[to] - PRODUCT_TIER_RANK[from];
}

export function compareSaasPlans(from: SaasPlan, to: SaasPlan): number {
  return SAAS_PLAN_RANK[to] - SAAS_PLAN_RANK[from];
}

export function productTierForRank(rank: number): ProductTier | null {
  const entry = (Object.entries(PRODUCT_TIER_RANK) as [ProductTier, number][]).find(
    ([, r]) => r === rank,
  );
  return entry?.[0] ?? null;
}

export function saasPlanForProductTier(tier: ProductTier): SaasPlan {
  return PRODUCT_TO_SAAS_PLAN[tier];
}

export function productTierForSaasPlan(plan: SaasPlan): ProductTier {
  return SAAS_TO_PRODUCT_TIER[plan];
}
