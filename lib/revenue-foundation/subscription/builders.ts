import type {
  SubscriptionBillingCycle,
  SubscriptionModel,
  SubscriptionPlan,
  SubscriptionRenewal,
} from "./types";

function addMonths(isoDate: string, months: number): string {
  const date = new Date(isoDate);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString();
}

export function buildSubscriptionPlans(input?: {
  deploymentId?: string;
}): SubscriptionPlan[] {
  const deploymentId = input?.deploymentId ?? "subscription-default";
  return [
    {
      planId: `sub-plan-monthly-${deploymentId}`,
      cycle: "monthly",
      name: "Pro 月付",
      tier: "pro",
      amount: 29900,
      currency: "CNY",
      billingIntervalMonths: 1,
    },
    {
      planId: `sub-plan-annual-${deploymentId}`,
      cycle: "annual",
      name: "Pro 年付",
      tier: "pro",
      amount: 299000,
      currency: "CNY",
      billingIntervalMonths: 12,
    },
    {
      planId: `sub-plan-enterprise-${deploymentId}`,
      cycle: "enterprise",
      name: "Enterprise 企业订阅",
      tier: "enterprise",
      amount: 999000,
      currency: "CNY",
      billingIntervalMonths: 12,
    },
  ];
}

export function buildSubscriptionModel(input?: {
  deploymentId?: string;
  cycle?: SubscriptionBillingCycle;
}): SubscriptionModel {
  const deploymentId = input?.deploymentId ?? "subscription-default";
  const cycle = input?.cycle ?? "monthly";
  const plans = buildSubscriptionPlans({ deploymentId });
  const plan = plans.find((item) => item.cycle === cycle) ?? plans[0];
  const startedAt = new Date().toISOString();

  return {
    subscriptionId: `subscription-${cycle}-${deploymentId}`,
    customerId: `customer-${deploymentId}`,
    planId: plan.planId,
    cycle: plan.cycle,
    status: "active",
    startedAt,
    currentPeriodStart: startedAt,
    currentPeriodEnd: addMonths(startedAt, plan.billingIntervalMonths),
    autoRenew: true,
  };
}

export function buildSubscriptions(input?: {
  deploymentId?: string;
}): SubscriptionModel[] {
  const deploymentId = input?.deploymentId ?? "subscription-default";
  const cycles: SubscriptionBillingCycle[] = ["monthly", "annual", "enterprise"];
  return cycles.map((cycle) => buildSubscriptionModel({ deploymentId, cycle }));
}

export function buildSubscriptionRenewal(input?: {
  deploymentId?: string;
  subscription?: SubscriptionModel;
}): SubscriptionRenewal {
  const deploymentId = input?.deploymentId ?? "subscription-default";
  const subscription =
    input?.subscription ?? buildSubscriptionModel({ deploymentId });
  const plans = buildSubscriptionPlans({ deploymentId });
  const plan = plans.find((item) => item.cycle === subscription.cycle);
  const amount = plan?.amount ?? 0;

  return {
    renewalId: `renewal-${subscription.subscriptionId}`,
    subscriptionId: subscription.subscriptionId,
    nextRenewalAt: subscription.currentPeriodEnd,
    renewalAmount: amount,
    currency: "CNY",
    renewalStatus: "scheduled",
    gracePeriodDays: subscription.cycle === "enterprise" ? 30 : 7,
  };
}

export function buildSubscriptionRenewals(input?: {
  deploymentId?: string;
}): SubscriptionRenewal[] {
  const deploymentId = input?.deploymentId ?? "subscription-default";
  return buildSubscriptions({ deploymentId }).map((subscription) =>
    buildSubscriptionRenewal({ deploymentId, subscription }),
  );
}
