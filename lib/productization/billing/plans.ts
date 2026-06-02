import type { ProductTier } from "../catalog";
import type { SubscriptionPlan } from "./types";

const PLAN_DEFINITIONS: readonly Omit<SubscriptionPlan, "planId">[] = [
  {
    tier: "starter",
    name: "Starter",
    billingPeriods: ["monthly", "quarterly", "annual"],
    customPricing: true,
    summary: "Starter subscription — custom pricing placeholder",
  },
  {
    tier: "professional",
    name: "Professional",
    billingPeriods: ["monthly", "quarterly", "annual"],
    customPricing: true,
    summary: "Professional subscription — custom pricing placeholder",
  },
  {
    tier: "enterprise",
    name: "Enterprise",
    billingPeriods: ["monthly", "quarterly", "annual"],
    customPricing: true,
    summary: "Enterprise subscription — custom pricing placeholder",
  },
];

export function buildSubscriptionPlans(): SubscriptionPlan[] {
  return PLAN_DEFINITIONS.map((plan) => ({
    planId: `subscription-plan-${plan.tier}`,
    ...plan,
  }));
}

export function buildSubscriptionPlan(tier: ProductTier): SubscriptionPlan {
  const plan = buildSubscriptionPlans().find((p) => p.tier === tier);
  if (!plan) {
    throw new Error(`Unknown subscription plan tier: ${tier}`);
  }
  return plan;
}
