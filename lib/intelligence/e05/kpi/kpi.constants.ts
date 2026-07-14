/**
 * E05-P3 — KPI Intelligence Engine constants
 * BASE: enterprise-e05-business-analytics-runtime-v1
 */

export const E05_KPI_ENGINE_ID =
  "enterprise-e05-kpi-intelligence-engine-v1" as const;

export const E05_KPI_VERSION = "e05-kpi-1" as const;
export const E05_KPI_FREEZE_VERSION = "e05-kpi-freeze-1" as const;

export const E05_KPI_BASE =
  "enterprise-e05-business-analytics-runtime-v1" as const;

export const KPI_KINDS = [
  "threshold",
  "target",
  "trend",
  "composite",
] as const;

export const KPI_STATUSES = [
  "green",
  "amber",
  "red",
  "unknown",
] as const;

export const KPI_TRACE_EVENT_KINDS = [
  "ready",
  "analytics",
  "evaluate",
  "interpret",
  "result",
  "error",
] as const;
