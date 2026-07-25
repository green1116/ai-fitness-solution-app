/**
 * Product P10 — Subscription & Billing constants
 * BASE: enterprise-product-p9-customer-success-v1
 * Isolated namespace: lib/product/p10
 */

export const PRODUCT_P10_SUBSCRIPTION_BILLING_ID =
  "enterprise-product-p10-subscription-billing-v1" as const;

export const PRODUCT_P10_SUBSCRIPTION_BILLING_VERSION =
  "product-p10-1" as const;

export const PRODUCT_P10_SUBSCRIPTION_BILLING_FREEZE_VERSION =
  "product-p10-subscription-billing-freeze-1" as const;

export const PRODUCT_P10_SUBSCRIPTION_BILLING_BASE =
  "enterprise-product-p9-customer-success-v1" as const;

export const PRODUCT_P10_SUBSCRIPTION_FREEZE_VERSION =
  "product-p10-subscription-billing-freeze-1" as const;

export const SUBSCRIPTION_STATUSES = [
  "TRIAL",
  "ACTIVE",
  "PAST_DUE",
  "PAUSED",
  "CANCELLED",
  "EXPIRED",
] as const;

export const PLAN_TIERS = [
  "STARTER",
  "GROWTH",
  "ENTERPRISE",
  "CUSTOM",
] as const;

export const PRICING_BILLING_CYCLES = [
  "MONTHLY",
  "QUARTERLY",
  "ANNUAL",
  "ONE_TIME",
] as const;

export const BILLING_STATUSES = [
  "IDLE",
  "OPEN",
  "INVOICED",
  "SETTLED",
  "FAILED",
] as const;

export const INVOICE_STATUSES = [
  "DRAFT",
  "ISSUED",
  "PAID",
  "VOID",
  "OVERDUE",
] as const;

export const PAYMENT_STATUSES = [
  "PENDING",
  "CAPTURED",
  "FAILED",
  "REFUNDED",
] as const;

export const ENTITLEMENT_KINDS = [
  "FEATURE",
  "SEAT",
  "MODULE",
  "API",
  "SUPPORT",
] as const;

export const QUOTA_UNITS = [
  "SEATS",
  "API_CALLS",
  "STORAGE_GB",
  "SITES",
  "COACHES",
] as const;

export const P10_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const P10_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
