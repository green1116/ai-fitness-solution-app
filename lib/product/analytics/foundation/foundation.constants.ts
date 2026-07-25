/**
 * Product Analytics — Analytics Foundation constants
 * MODULE: Analytics
 * BASE: enterprise-product-customer-baseline-v1
 * Isolated namespace: lib/product/analytics
 */

export const PRODUCT_ANALYTICS_FOUNDATION_ID =
  "enterprise-product-analytics-foundation-v1" as const;

export const PRODUCT_ANALYTICS_FOUNDATION_VERSION =
  "product-analytics-1" as const;

export const PRODUCT_ANALYTICS_FOUNDATION_FREEZE_VERSION =
  "product-analytics-foundation-freeze-1" as const;

export const PRODUCT_ANALYTICS_FOUNDATION_BASE =
  "enterprise-product-customer-baseline-v1" as const;

export const PRODUCT_ANALYTICS_FREEZE_VERSION =
  "product-analytics-foundation-freeze-1" as const;

export const METRIC_KINDS = [
  "COUNTER",
  "GAUGE",
  "RATIO",
] as const;

export const DATASET_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "ARCHIVED",
] as const;

export const PIPELINE_STATUSES = [
  "IDLE",
  "RUNNING",
  "FAILED",
  "SUCCEEDED",
] as const;

export const REPORT_KINDS = [
  "SUMMARY",
  "TREND",
  "BREAKDOWN",
] as const;

export const ANALYTICS_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const ANALYTICS_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
