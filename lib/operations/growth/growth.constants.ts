/**
 * Post-Launch P5 — Growth Analytics Operations constants
 * BASE: enterprise-post-launch-p4-release-management-operations-v1
 */

export const OPERATIONS_GROWTH_ANALYTICS_ID =
  "enterprise-post-launch-p5-growth-analytics-operations-v1" as const;

export const OPERATIONS_GROWTH_ANALYTICS_VERSION = "operations-p5-1" as const;
export const OPERATIONS_GROWTH_ANALYTICS_FREEZE_VERSION =
  "operations-growth-analytics-freeze-1" as const;

export const OPERATIONS_GROWTH_ANALYTICS_BASE =
  "enterprise-post-launch-p4-release-management-operations-v1" as const;

export const OPERATIONS_P5_GROWTH_ANALYTICS_FREEZE_VERSION =
  "operations-p5-growth-analytics-operations-freeze-1" as const;

export const GROWTH_SIGNAL_STRENGTHS = [
  "STRONG",
  "MODERATE",
  "WEAK",
  "NONE",
] as const;

export const EXPANSION_SIGNAL_KINDS = [
  "USAGE_SURGE",
  "FEATURE_ADOPTION",
  "SEAT_GROWTH",
  "TIER_UPGRADE",
  "API_VOLUME",
] as const;

export const GROWTH_TRENDS = [
  "UP",
  "FLAT",
  "DOWN",
  "UNKNOWN",
] as const;

export const GROWTH_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const GROWTH_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
