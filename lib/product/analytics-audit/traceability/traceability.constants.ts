/**
 * Product Analytics Audit — Traceability constants
 * MODULE: Analytics Audit
 * BASE: enterprise-product-bi-integration-v1
 * Isolated namespace: lib/product/analytics-audit
 */

export const PRODUCT_ANALYTICS_AUDIT_ID =
  "enterprise-product-analytics-audit-v1" as const;

export const PRODUCT_ANALYTICS_AUDIT_VERSION =
  "product-analytics-audit-1" as const;

export const PRODUCT_ANALYTICS_AUDIT_FREEZE_VERSION =
  "product-analytics-audit-freeze-1" as const;

export const PRODUCT_ANALYTICS_AUDIT_BASE =
  "enterprise-product-bi-integration-v1" as const;

export const PRODUCT_ANALYTICS_AUDIT_FREEZE_TAG =
  "product-analytics-audit-freeze-1" as const;

export const ANALYTICS_AUDIT_CATEGORIES = [
  "METRIC",
  "KPI",
  "DASHBOARD",
  "REPORT",
  "FORECAST",
  "BI",
] as const;

export const ANALYTICS_AUDIT_SEVERITIES = [
  "INFO",
  "WARN",
  "CRITICAL",
] as const;

export const ANALYTICS_TRAIL_STATUSES = [
  "RECORDED",
  "SEALED",
  "EXPORTED",
] as const;

export const ANALYTICS_INTEGRITY_RESULTS = [
  "INTACT",
  "TAMPERED",
] as const;

export const ANALYTICS_AUDIT_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const ANALYTICS_AUDIT_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
