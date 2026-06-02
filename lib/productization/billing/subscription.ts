import { buildSubscriptionPlan } from "./plans";
import type { BillingPeriod, Subscription } from "./types";

function addPeriodToDate(date: Date, period: BillingPeriod): Date {
  const result = new Date(date);
  if (period === "monthly") {
    result.setMonth(result.getMonth() + 1);
  } else if (period === "quarterly") {
    result.setMonth(result.getMonth() + 3);
  } else {
    result.setFullYear(result.getFullYear() + 1);
  }
  return result;
}

export function buildSubscription(input?: {
  deploymentId?: string;
  tier?: "starter" | "professional" | "enterprise";
  billingPeriod?: BillingPeriod;
}): Subscription {
  const deploymentId = input?.deploymentId ?? "subscription-billing-default";
  const tier = input?.tier ?? "professional";
  const billingPeriod = input?.billingPeriod ?? "annual";
  const plan = buildSubscriptionPlan(tier);
  const startedAt = new Date();

  return {
    subscriptionId: `subscription-${deploymentId}`,
    customerId: `customer-${deploymentId}`,
    planId: plan.planId,
    tier,
    billingPeriod,
    status: "active",
    startedAt: startedAt.toISOString(),
    renewsAt: addPeriodToDate(startedAt, billingPeriod).toISOString(),
  };
}

export function buildSubscriptions(input?: { deploymentId?: string }): Subscription[] {
  const deploymentId = input?.deploymentId ?? "subscription-billing-default";
  return [
    buildSubscription({ deploymentId: `${deploymentId}-starter`, tier: "starter", billingPeriod: "monthly" }),
    buildSubscription({
      deploymentId: `${deploymentId}-professional`,
      tier: "professional",
      billingPeriod: "quarterly",
    }),
    buildSubscription({ deploymentId: `${deploymentId}-enterprise`, tier: "enterprise", billingPeriod: "annual" }),
  ];
}
