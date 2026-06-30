/**
 * V64 P1 — Plan registry (product + subscription plans)
 */
import { buildProductPlans } from "@/lib/productization/catalog";
import { buildSubscriptionPlans } from "@/lib/productization/billing/plans";
import type { ProductTier } from "@/lib/productization/catalog";

import {
  PRODUCT_TO_SAAS_PLAN,
  PRODUCT_TO_USER_TIER,
} from "./capability.map";
import type { PlanRegistry, PlanRegistryEntry } from "./types";
import { V64_COMMERCIAL_FOUNDATION_VERSION } from "./types";

function buildRegistryEntry(
  tier: ProductTier,
  productName: string,
  subscriptionPlanId: string,
): PlanRegistryEntry {
  return {
    planId: `plan-${tier}`,
    productTier: tier,
    saasPlan: PRODUCT_TO_SAAS_PLAN[tier],
    userTier: PRODUCT_TO_USER_TIER[tier],
    productName,
    subscriptionPlanId,
  };
}

export function buildPlanRegistry(input?: { deploymentId?: string }): PlanRegistry {
  const deploymentId = input?.deploymentId ?? "v64-commercial-foundation-default";
  const products = buildProductPlans();
  const subscriptions = buildSubscriptionPlans();
  const plans = products.map((product) => {
    const sub = subscriptions.find((s) => s.tier === product.tier);
    if (!sub) {
      throw new Error(`Missing subscription plan for tier: ${product.tier}`);
    }
    return buildRegistryEntry(product.tier, product.name, sub.planId);
  });
  return {
    version: V64_COMMERCIAL_FOUNDATION_VERSION,
    registryId: `plan-registry-${deploymentId}`,
    plans,
    summary: `plan-registry count=${plans.length}`,
  };
}

export function getPlanRegistryEntry(tier: ProductTier): PlanRegistryEntry {
  const entry = buildPlanRegistry().plans.find((p) => p.productTier === tier);
  if (!entry) {
    throw new Error(`Unknown plan registry tier: ${tier}`);
  }
  return entry;
}
