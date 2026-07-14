/**
 * E05-P4 — Forecasting Runtime constants
 * BASE: enterprise-e05-p3-kpi-intelligence-engine-v1
 */

export const E05_FORECAST_RUNTIME_ID =
  "enterprise-e05-forecasting-runtime-v1" as const;

export const E05_FORECAST_VERSION = "e05-forecast-1" as const;
export const E05_FORECAST_FREEZE_VERSION = "e05-forecast-freeze-1" as const;

export const E05_FORECAST_BASE =
  "enterprise-e05-p3-kpi-intelligence-engine-v1" as const;

export const FORECAST_HORIZONS = [
  "near",
  "mid",
  "far",
] as const;

export const FORECAST_DIRECTIONS = [
  "up",
  "down",
  "flat",
] as const;

export const FORECAST_MODEL_KINDS = [
  "linear",
  "momentum",
  "target-gap",
] as const;

export const FORECAST_TRACE_EVENT_KINDS = [
  "ready",
  "kpi",
  "model",
  "project",
  "result",
  "error",
] as const;
