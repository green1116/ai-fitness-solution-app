/**
 * Product Forecast — Trend constants
 * MODULE: Forecast
 * BASE: enterprise-product-report-engine-v1
 * Isolated namespace: lib/product/forecast
 */

export const PRODUCT_FORECAST_TREND_ID =
  "enterprise-product-forecast-trend-v1" as const;

export const PRODUCT_FORECAST_TREND_VERSION =
  "product-forecast-1" as const;

export const PRODUCT_FORECAST_TREND_FREEZE_VERSION =
  "product-forecast-trend-freeze-1" as const;

export const PRODUCT_FORECAST_TREND_BASE =
  "enterprise-product-report-engine-v1" as const;

export const PRODUCT_FORECAST_FREEZE_VERSION =
  "product-forecast-trend-freeze-1" as const;

export const FORECAST_MODEL_KINDS = [
  "LINEAR",
  "SEASONAL",
  "ENSEMBLE",
] as const;

export const SERIES_GRANULARITIES = [
  "DAY",
  "WEEK",
  "MONTH",
] as const;

export const PROJECTION_HORIZONS = [
  "SHORT",
  "MEDIUM",
  "LONG",
] as const;

export const TREND_DIRECTIONS = [
  "UP",
  "FLAT",
  "DOWN",
] as const;

export const FORECAST_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const FORECAST_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
