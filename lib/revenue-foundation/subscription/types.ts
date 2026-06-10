import type { REVENUE_FOUNDATION_VERSION } from "../shared/types";

export const SUBSCRIPTION_RUNTIME_VERSION = "v10.0-subscription-runtime-1" as const;

export type SubscriptionBillingCycle = "monthly" | "annual" | "enterprise";

export type SubscriptionStatus = "active" | "past-due" | "cancelled" | "trialing" | "renewing";

export interface SubscriptionPlan {
  planId: string;
  cycle: SubscriptionBillingCycle;
  name: string;
  tier: "pro" | "enterprise";
  amount: number;
  currency: string;
  billingIntervalMonths: number;
}

export interface SubscriptionModel {
  subscriptionId: string;
  customerId: string;
  planId: string;
  cycle: SubscriptionBillingCycle;
  status: SubscriptionStatus;
  startedAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  autoRenew: boolean;
}

export interface SubscriptionRenewal {
  renewalId: string;
  subscriptionId: string;
  nextRenewalAt: string;
  renewalAmount: number;
  currency: string;
  renewalStatus: "scheduled" | "due" | "completed" | "failed";
  gracePeriodDays: number;
}

export interface SubscriptionRuntimePayload {
  version: typeof SUBSCRIPTION_RUNTIME_VERSION;
  foundationVersion: typeof REVENUE_FOUNDATION_VERSION;
  plans: SubscriptionPlan[];
  subscriptions: SubscriptionModel[];
  renewals: SubscriptionRenewal[];
  summary: string;
}
