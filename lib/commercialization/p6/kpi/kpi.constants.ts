/**
 * Commercialization P6 — Revenue Intelligence constants
 * BASE: enterprise-commercialization-p5-delivery-operations-foundation-v1
 * Isolated namespace: lib/commercialization/p6
 */

export const COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID =
  "enterprise-commercialization-p6-revenue-intelligence-v1" as const;

export const COMMERCIALIZATION_REVENUE_INTELLIGENCE_VERSION =
  "commercialization-p6-1" as const;

export const COMMERCIALIZATION_REVENUE_INTELLIGENCE_FREEZE_VERSION =
  "commercialization-revenue-intelligence-freeze-1" as const;

export const COMMERCIALIZATION_REVENUE_INTELLIGENCE_BASE =
  "enterprise-commercialization-p5-delivery-operations-foundation-v1" as const;

export const COMMERCIALIZATION_P6_REVENUE_FREEZE_VERSION =
  "commercialization-p6-revenue-intelligence-freeze-1" as const;

export const REVENUE_STREAM_KINDS = [
  "SUBSCRIPTION",
  "USAGE",
  "SERVICES",
  "MARKETPLACE",
] as const;

export const REVENUE_PERIODS = [
  "MONTHLY",
  "QUARTERLY",
  "ANNUAL",
] as const;

export const KPI_CATEGORIES = [
  "GROWTH",
  "RETENTION",
  "EFFICIENCY",
  "EXPANSION",
] as const;

export const HEALTH_BANDS = [
  "EXCELLENT",
  "GOOD",
  "FAIR",
  "POOR",
  "CRITICAL",
] as const;

export const REPORT_KINDS = [
  "EXECUTIVE",
  "OPERATIONS",
  "CUSTOMER",
  "FORECAST",
] as const;

export const REVENUE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const REVENUE_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
