/**
 * Product KPI — Management constants
 * MODULE: KPI
 * BASE: enterprise-product-analytics-foundation-v1
 * Isolated namespace: lib/product/kpi
 */

export const PRODUCT_KPI_MANAGEMENT_ID =
  "enterprise-product-kpi-management-v1" as const;

export const PRODUCT_KPI_MANAGEMENT_VERSION =
  "product-kpi-1" as const;

export const PRODUCT_KPI_MANAGEMENT_FREEZE_VERSION =
  "product-kpi-management-freeze-1" as const;

export const PRODUCT_KPI_MANAGEMENT_BASE =
  "enterprise-product-analytics-foundation-v1" as const;

export const PRODUCT_KPI_FREEZE_VERSION =
  "product-kpi-management-freeze-1" as const;

export const KPI_CATEGORIES = [
  "REVENUE",
  "RETENTION",
  "ENGAGEMENT",
  "OPERATIONS",
] as const;

export const KPI_STATUSES = ["DRAFT", "ACTIVE", "RETIRED"] as const;

export const TARGET_PERIODS = ["MONTHLY", "QUARTERLY", "YEARLY"] as const;

export const MEASUREMENT_RESULTS = [
  "BELOW",
  "ON_TRACK",
  "ABOVE",
] as const;

export const KPI_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const KPI_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
