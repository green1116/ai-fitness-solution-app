/**
 * Product API — Foundation constants
 * MODULE: API Foundation (M07-P1)
 * BASE: enterprise-product-notification-baseline-v1
 * Isolated namespace: lib/product/api
 */

export const PRODUCT_API_FOUNDATION_ID =
  "enterprise-product-api-foundation-v1" as const;

export const PRODUCT_API_FOUNDATION_VERSION =
  "product-api-1" as const;

export const PRODUCT_API_FOUNDATION_FREEZE_VERSION =
  "product-api-foundation-freeze-1" as const;

export const PRODUCT_API_FOUNDATION_BASE =
  "enterprise-product-notification-baseline-v1" as const;

export const PRODUCT_API_FREEZE_VERSION =
  "product-api-foundation-freeze-1" as const;

export const API_KINDS = [
  "REST",
  "RPC",
  "WEBHOOK",
  "INTERNAL",
] as const;

export const API_LIFECYCLE_STATES = [
  "DRAFT",
  "PUBLISHED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const API_POLICY_MODES = [
  "OPEN",
  "RESTRICTED",
  "INTERNAL_ONLY",
] as const;

export const API_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const API_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
