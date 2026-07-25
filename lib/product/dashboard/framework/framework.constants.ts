/**
 * Product Dashboard — Framework constants
 * MODULE: Dashboard
 * BASE: enterprise-product-kpi-management-v1
 * Isolated namespace: lib/product/dashboard
 */

export const PRODUCT_DASHBOARD_FRAMEWORK_ID =
  "enterprise-product-dashboard-framework-v1" as const;

export const PRODUCT_DASHBOARD_FRAMEWORK_VERSION =
  "product-dashboard-1" as const;

export const PRODUCT_DASHBOARD_FRAMEWORK_FREEZE_VERSION =
  "product-dashboard-framework-freeze-1" as const;

export const PRODUCT_DASHBOARD_FRAMEWORK_BASE =
  "enterprise-product-kpi-management-v1" as const;

export const PRODUCT_DASHBOARD_FREEZE_VERSION =
  "product-dashboard-framework-freeze-1" as const;

export const DASHBOARD_KINDS = [
  "EXECUTIVE",
  "OPERATIONAL",
  "ANALYTICAL",
] as const;

export const DASHBOARD_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
] as const;

export const WIDGET_KINDS = [
  "KPI",
  "CHART",
  "TABLE",
  "TEXT",
] as const;

export const LAYOUT_REGIONS = [
  "HEADER",
  "MAIN",
  "SIDEBAR",
  "FOOTER",
] as const;

export const DASHBOARD_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const DASHBOARD_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
