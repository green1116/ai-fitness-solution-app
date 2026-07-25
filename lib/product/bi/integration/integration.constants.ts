/**
 * Product BI — Integration constants
 * MODULE: BI
 * BASE: enterprise-product-forecast-trend-v1
 * Isolated namespace: lib/product/bi
 */

export const PRODUCT_BI_INTEGRATION_ID =
  "enterprise-product-bi-integration-v1" as const;

export const PRODUCT_BI_INTEGRATION_VERSION =
  "product-bi-1" as const;

export const PRODUCT_BI_INTEGRATION_FREEZE_VERSION =
  "product-bi-integration-freeze-1" as const;

export const PRODUCT_BI_INTEGRATION_BASE =
  "enterprise-product-forecast-trend-v1" as const;

export const PRODUCT_BI_FREEZE_VERSION =
  "product-bi-integration-freeze-1" as const;

export const BI_CONNECTOR_KINDS = [
  "WAREHOUSE",
  "LAKE",
  "CUBE",
] as const;

export const BI_CONNECTOR_STATUSES = [
  "DISCONNECTED",
  "CONNECTED",
  "ERROR",
] as const;

export const BI_SYNC_RESULTS = [
  "SUCCESS",
  "PARTIAL",
  "FAILED",
] as const;

export const BI_QUERY_KINDS = [
  "METRIC",
  "DIMENSION",
  "FORECAST",
] as const;

export const BI_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const BI_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
