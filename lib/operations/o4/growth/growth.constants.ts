/**
 * Operations O4 — Growth Analytics Foundation constants
 * BASE: enterprise-operations-o3-support-operations-v1
 * Isolated namespace: lib/operations/o4
 */

export const OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_ID =
  "enterprise-operations-o4-growth-analytics-foundation-v1" as const;

export const OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_VERSION =
  "operations-o4-1" as const;

export const OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_FREEZE_VERSION =
  "operations-o4-growth-analytics-foundation-freeze-1" as const;

export const OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_BASE =
  "enterprise-operations-o3-support-operations-v1" as const;

export const OPERATIONS_O4_GROWTH_FREEZE_VERSION =
  "operations-o4-growth-analytics-foundation-freeze-1" as const;

export const GROWTH_METRIC_KINDS = [
  "SIGNUP",
  "ACTIVATION",
  "CONVERSION",
  "REVENUE",
] as const;

export const RETENTION_BANDS = [
  "EXCELLENT",
  "HEALTHY",
  "AT_RISK",
  "CHURNING",
] as const;

export const EXPANSION_SIGNAL_KINDS = [
  "SEAT_GROWTH",
  "USAGE_SPIKE",
  "FEATURE_UPSELL",
  "RENEWAL_LIFT",
] as const;

export const COHORT_PERIODS = [
  "WEEKLY",
  "MONTHLY",
  "QUARTERLY",
] as const;

export const FORECAST_HORIZONS = [
  "30D",
  "90D",
  "180D",
  "365D",
] as const;

export const O4_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const O4_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
