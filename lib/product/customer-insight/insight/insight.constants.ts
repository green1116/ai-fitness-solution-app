/**
 * Product Customer Insight — Insight constants
 * MODULE: Customer Insight
 * BASE: enterprise-product-customer-activity-v1
 * Isolated namespace: lib/product/customer-insight
 */

export const PRODUCT_CUSTOMER_INSIGHT_ID =
  "enterprise-product-customer-insight-v1" as const;

export const PRODUCT_CUSTOMER_INSIGHT_VERSION =
  "product-customer-insight-1" as const;

export const PRODUCT_CUSTOMER_INSIGHT_FREEZE_VERSION =
  "product-customer-insight-freeze-1" as const;

export const PRODUCT_CUSTOMER_INSIGHT_BASE =
  "enterprise-product-customer-activity-v1" as const;

export const PRODUCT_CUSTOMER_INSIGHT_LAYER_FREEZE_VERSION =
  "product-customer-insight-freeze-1" as const;

export const INSIGHT_SIGNAL_KINDS = [
  "CHURN_RISK",
  "UPSSELL",
  "ENGAGEMENT",
  "SUPPORT",
] as const;

export const INSIGHT_SCORE_KINDS = [
  "HEALTH",
  "VALUE",
  "RISK",
] as const;

export const INSIGHT_SEGMENT_CODES = [
  "GROWTH",
  "STABLE",
  "AT_RISK",
] as const;

export const INSIGHT_RECOMMENDATION_KINDS = [
  "RETAIN",
  "EXPAND",
  "NURTURE",
] as const;

export const CUSTOMER_INSIGHT_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const CUSTOMER_INSIGHT_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
