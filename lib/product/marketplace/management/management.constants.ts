/**
 * Product Marketplace — Foundation constants
 * MODULE: Marketplace Foundation (M08-P1)
 * BASE: enterprise-product-api-baseline-v1
 * Isolated namespace: lib/product/marketplace
 */

export const PRODUCT_MARKETPLACE_FOUNDATION_ID =
  "enterprise-product-marketplace-foundation-v1" as const;

export const PRODUCT_MARKETPLACE_FOUNDATION_VERSION =
  "product-marketplace-1" as const;

export const PRODUCT_MARKETPLACE_FOUNDATION_FREEZE_VERSION =
  "product-marketplace-foundation-freeze-1" as const;

export const PRODUCT_MARKETPLACE_FOUNDATION_BASE =
  "enterprise-product-api-baseline-v1" as const;

export const PRODUCT_MARKETPLACE_FREEZE_VERSION =
  "product-marketplace-foundation-freeze-1" as const;

export const MARKETPLACE_LISTING_KINDS = [
  "APP",
  "SERVICE",
  "TEMPLATE",
  "INTERNAL",
] as const;

export const MARKETPLACE_LIFECYCLE_STATES = [
  "DRAFT",
  "PUBLISHED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const MARKETPLACE_POLICY_MODES = [
  "OPEN",
  "RESTRICTED",
  "INTERNAL_ONLY",
] as const;

export const MARKETPLACE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const MARKETPLACE_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
