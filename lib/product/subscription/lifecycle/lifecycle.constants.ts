/**
 * Product Subscription — Lifecycle constants
 * MODULE: Subscription
 * BASE: enterprise-product-billing-foundation-v1
 * Isolated namespace: lib/product/subscription
 */

export const PRODUCT_SUBSCRIPTION_LIFECYCLE_ID =
  "enterprise-product-subscription-lifecycle-v1" as const;

export const PRODUCT_SUBSCRIPTION_LIFECYCLE_VERSION =
  "product-subscription-1" as const;

export const PRODUCT_SUBSCRIPTION_LIFECYCLE_FREEZE_VERSION =
  "product-subscription-lifecycle-freeze-1" as const;

export const PRODUCT_SUBSCRIPTION_LIFECYCLE_BASE =
  "enterprise-product-billing-foundation-v1" as const;

export const PRODUCT_SUBSCRIPTION_FREEZE_VERSION =
  "product-subscription-lifecycle-freeze-1" as const;

export const SUBSCRIPTION_STATUSES = [
  "TRIAL",
  "ACTIVE",
  "PAST_DUE",
  "SUSPENDED",
  "CANCELED",
] as const;

export const ENTITLEMENT_STATUSES = [
  "GRANTED",
  "REVOKED",
] as const;

export const RENEWAL_RESULTS = [
  "RENEWED",
  "FAILED",
] as const;

export const CHANGE_KINDS = [
  "UPGRADE",
  "DOWNGRADE",
  "SEAT_CHANGE",
] as const;

export const SUBSCRIPTION_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const SUBSCRIPTION_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
