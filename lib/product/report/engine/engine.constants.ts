/**
 * Product Report — Engine constants
 * MODULE: Report
 * BASE: enterprise-product-dashboard-framework-v1
 * Isolated namespace: lib/product/report
 */

export const PRODUCT_REPORT_ENGINE_ID =
  "enterprise-product-report-engine-v1" as const;

export const PRODUCT_REPORT_ENGINE_VERSION =
  "product-report-1" as const;

export const PRODUCT_REPORT_ENGINE_FREEZE_VERSION =
  "product-report-engine-freeze-1" as const;

export const PRODUCT_REPORT_ENGINE_BASE =
  "enterprise-product-dashboard-framework-v1" as const;

export const PRODUCT_REPORT_FREEZE_VERSION =
  "product-report-engine-freeze-1" as const;

export const REPORT_TEMPLATE_KINDS = [
  "SUMMARY",
  "DETAIL",
  "COMPLIANCE",
] as const;

export const REPORT_JOB_STATUSES = [
  "QUEUED",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
] as const;

export const REPORT_FORMATS = ["PDF", "CSV", "JSON"] as const;

export const DELIVERY_CHANNELS = [
  "PORTAL",
  "EMAIL",
  "STORAGE",
] as const;

export const REPORT_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const REPORT_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
