/**
 * Product P9 — Customer Success constants
 * BASE: enterprise-product-p8-tender-delivery-v1
 * Isolated namespace: lib/product/p9
 */

export const PRODUCT_P9_CUSTOMER_SUCCESS_ID =
  "enterprise-product-p9-customer-success-v1" as const;

export const PRODUCT_P9_CUSTOMER_SUCCESS_VERSION = "product-p9-1" as const;

export const PRODUCT_P9_CUSTOMER_SUCCESS_FREEZE_VERSION =
  "product-p9-customer-success-freeze-1" as const;

export const PRODUCT_P9_CUSTOMER_SUCCESS_BASE =
  "enterprise-product-p8-tender-delivery-v1" as const;

export const PRODUCT_P9_SUCCESS_FREEZE_VERSION =
  "product-p9-customer-success-freeze-1" as const;

export const HEALTH_STATUSES = [
  "HEALTHY",
  "WATCH",
  "AT_RISK",
  "CRITICAL",
  "UNKNOWN",
] as const;

export const USAGE_TRENDS = [
  "UP",
  "FLAT",
  "DOWN",
  "SPIKE",
  "INACTIVE",
] as const;

export const FEEDBACK_KINDS = [
  "NPS",
  "FEATURE",
  "SUPPORT",
  "COMPLAINT",
  "PRAISE",
] as const;

export const SATISFACTION_LEVELS = [
  "VERY_HIGH",
  "HIGH",
  "NEUTRAL",
  "LOW",
  "VERY_LOW",
] as const;

export const SUCCESS_PLAN_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "ON_TRACK",
  "AT_RISK",
  "COMPLETE",
] as const;

export const RENEWAL_STATUSES = [
  "UPCOMING",
  "IN_DISCUSSION",
  "COMMITTED",
  "RENEWED",
  "CHURNED",
] as const;

export const EXPANSION_STATUSES = [
  "IDENTIFIED",
  "QUALIFIED",
  "PROPOSED",
  "WON",
  "LOST",
] as const;

export const P9_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const P9_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
