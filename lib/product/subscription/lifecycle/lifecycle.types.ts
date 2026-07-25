/**
 * Product Subscription — readiness / manifest types
 */

import type {
  PRODUCT_SUBSCRIPTION_LIFECYCLE_BASE,
  PRODUCT_SUBSCRIPTION_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_SUBSCRIPTION_LIFECYCLE_ID,
  PRODUCT_SUBSCRIPTION_LIFECYCLE_VERSION,
  SUBSCRIPTION_MANAGER_STATUSES,
  SUBSCRIPTION_READINESS_VERDICTS,
} from "./lifecycle.constants";

export type SubscriptionReadinessVerdict =
  (typeof SUBSCRIPTION_READINESS_VERDICTS)[number];
export type SubscriptionManagerStatus =
  (typeof SUBSCRIPTION_MANAGER_STATUSES)[number];

export type SubscriptionReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type SubscriptionReadinessResult = {
  verdict: SubscriptionReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: SubscriptionReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type SubscriptionRegistryManifest = {
  foundationId: typeof PRODUCT_SUBSCRIPTION_LIFECYCLE_ID;
  version: typeof PRODUCT_SUBSCRIPTION_LIFECYCLE_VERSION;
  freezeVersion: typeof PRODUCT_SUBSCRIPTION_LIFECYCLE_FREEZE_VERSION;
  base: typeof PRODUCT_SUBSCRIPTION_LIFECYCLE_BASE;
  subscriptionCount: number;
  entitlementCount: number;
  renewalCount: number;
  changeCount: number;
};
