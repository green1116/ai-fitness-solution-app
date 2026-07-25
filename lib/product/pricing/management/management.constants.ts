/**
 * Product Pricing — Pricing Management constants
 * MODULE: Pricing
 * BASE: enterprise-product-subscription-lifecycle-v1
 * Isolated namespace: lib/product/pricing
 */

export const PRODUCT_PRICING_MANAGEMENT_ID =
  "enterprise-product-pricing-management-v1" as const;

export const PRODUCT_PRICING_MANAGEMENT_VERSION =
  "product-pricing-1" as const;

export const PRODUCT_PRICING_MANAGEMENT_FREEZE_VERSION =
  "product-pricing-management-freeze-1" as const;

export const PRODUCT_PRICING_MANAGEMENT_BASE =
  "enterprise-product-subscription-lifecycle-v1" as const;

export const PRODUCT_PRICING_FREEZE_VERSION =
  "product-pricing-management-freeze-1" as const;

export const PRICING_CATALOG_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
] as const;

export const PRICE_MODELS = [
  "FLAT",
  "PER_SEAT",
  "USAGE",
] as const;

export const DISCOUNT_KINDS = [
  "PERCENT",
  "FIXED",
] as const;

export const QUOTE_STATUSES = [
  "OPEN",
  "ACCEPTED",
  "EXPIRED",
] as const;

export const PRICING_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const PRICING_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
