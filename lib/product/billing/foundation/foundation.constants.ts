/**
 * Product Billing — Billing Foundation constants
 * MODULE: Billing
 * BASE: enterprise-product-auth-baseline-v1
 * Isolated namespace: lib/product/billing
 */

export const PRODUCT_BILLING_FOUNDATION_ID =
  "enterprise-product-billing-foundation-v1" as const;

export const PRODUCT_BILLING_FOUNDATION_VERSION =
  "product-billing-1" as const;

export const PRODUCT_BILLING_FOUNDATION_FREEZE_VERSION =
  "product-billing-foundation-freeze-1" as const;

export const PRODUCT_BILLING_FOUNDATION_BASE =
  "enterprise-product-auth-baseline-v1" as const;

export const PRODUCT_BILLING_FREEZE_VERSION =
  "product-billing-foundation-freeze-1" as const;

export const BILLING_ACCOUNT_STATUSES = [
  "ACTIVE",
  "SUSPENDED",
  "CLOSED",
] as const;

export const BILLING_PLAN_TIERS = [
  "STARTER",
  "GROWTH",
  "ENTERPRISE",
] as const;

export const INVOICE_STATUSES = [
  "DRAFT",
  "ISSUED",
  "PAID",
  "VOID",
] as const;

export const PAYMENT_STATUSES = [
  "PENDING",
  "CAPTURED",
  "FAILED",
  "REFUNDED",
] as const;

export const BILLING_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const BILLING_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
