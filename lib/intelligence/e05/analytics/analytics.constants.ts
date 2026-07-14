/**
 * E05-P2 — Business Analytics Runtime constants
 * BASE: enterprise-e05-p1-intelligence-foundation-v1
 */

export const E05_ANALYTICS_RUNTIME_ID =
  "enterprise-e05-business-analytics-runtime-v1" as const;

export const E05_ANALYTICS_VERSION = "e05-analytics-1" as const;
export const E05_ANALYTICS_FREEZE_VERSION = "e05-analytics-freeze-1" as const;

export const E05_ANALYTICS_BASE =
  "enterprise-e05-p1-intelligence-foundation-v1" as const;

/** Instance lifecycle: READY -> RUNNING -> COMPLETED -> RESULT */
export const ANALYTICS_INSTANCE_PHASES = [
  "READY",
  "RUNNING",
  "COMPLETED",
  "RESULT",
] as const;

export const ANALYTICS_INSTANCE_TRANSITIONS: ReadonlyArray<
  readonly [string, string]
> = [
  ["READY", "RUNNING"],
  ["RUNNING", "COMPLETED"],
  ["COMPLETED", "RESULT"],
] as const;

export const METRIC_KINDS = [
  "count",
  "ratio",
  "score",
  "band",
  "index",
] as const;

export const ANALYTICS_TRACE_EVENT_KINDS = [
  "ready",
  "metric",
  "calculate",
  "insight",
  "result",
  "error",
] as const;
