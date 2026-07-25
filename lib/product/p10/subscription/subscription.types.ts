/**
 * Product P10 — Subscription types + readiness / manifest
 */

import type {
  P10_MANAGER_STATUSES,
  P10_READINESS_VERDICTS,
  PRODUCT_P10_SUBSCRIPTION_BILLING_BASE,
  PRODUCT_P10_SUBSCRIPTION_BILLING_FREEZE_VERSION,
  PRODUCT_P10_SUBSCRIPTION_BILLING_ID,
  PRODUCT_P10_SUBSCRIPTION_BILLING_VERSION,
  SUBSCRIPTION_STATUSES,
} from "./subscription.constants";

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];
export type P10ReadinessVerdict = (typeof P10_READINESS_VERDICTS)[number];
export type P10ManagerStatus = (typeof P10_MANAGER_STATUSES)[number];
export type SubscriptionMetadata = Record<string, unknown>;

export type Subscription = {
  id: string;
  accountRef: string;
  healthRef: string;
  planId?: string;
  status: SubscriptionStatus;
  owner: string;
  detail: string;
  metadata: SubscriptionMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateSubscriptionInput = {
  id?: string;
  accountRef: string;
  healthRef: string;
  owner: string;
  planId?: string;
  metadata?: SubscriptionMetadata;
};

export type UpdateSubscriptionStatusInput = {
  subscriptionId: string;
  status: SubscriptionStatus;
};

export type BindSubscriptionPlanInput = {
  subscriptionId: string;
  planId: string;
};

export type P10ReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type P10ReadinessResult = {
  verdict: P10ReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: P10ReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type P10RegistryManifest = {
  foundationId: typeof PRODUCT_P10_SUBSCRIPTION_BILLING_ID;
  version: typeof PRODUCT_P10_SUBSCRIPTION_BILLING_VERSION;
  freezeVersion: typeof PRODUCT_P10_SUBSCRIPTION_BILLING_FREEZE_VERSION;
  base: typeof PRODUCT_P10_SUBSCRIPTION_BILLING_BASE;
  subscriptionCount: number;
  planCount: number;
  pricingCount: number;
  billingCount: number;
  invoiceCount: number;
  paymentCount: number;
  entitlementCount: number;
  quotaCount: number;
};
