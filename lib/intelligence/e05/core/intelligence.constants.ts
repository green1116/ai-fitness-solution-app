/**
 * E05-P1 — Intelligence Foundation constants
 * BASE: enterprise-e04-business-agent-platform-freeze-v1
 */

export const E05_INTELLIGENCE_PLATFORM_ID =
  "enterprise-e05-intelligence-platform-v1" as const;

export const E05_INTELLIGENCE_VERSION = "e05-intelligence-1" as const;
export const E05_INTELLIGENCE_FREEZE_VERSION =
  "e05-intelligence-freeze-1" as const;

export const E05_INTELLIGENCE_BASE =
  "enterprise-e04-business-agent-platform-freeze-v1" as const;

export const INTELLIGENCE_DOMAINS = [
  "opportunity",
  "risk",
  "pricing",
  "compliance",
  "delivery",
  "synthesis",
] as const;

export const INTELLIGENCE_STATUSES = [
  "registered",
  "ready",
  "running",
  "succeeded",
  "failed",
  "retired",
] as const;

export const INTELLIGENCE_LIFECYCLE_STAGES = [
  "declared",
  "registered",
  "bound",
  "activated",
  "completed",
] as const;

export const INTELLIGENCE_LIFECYCLE_TRANSITIONS: ReadonlyArray<
  readonly [string, string]
> = [
  ["declared", "registered"],
  ["registered", "bound"],
  ["bound", "activated"],
  ["activated", "completed"],
] as const;

export const INSIGHT_KINDS = [
  "signal",
  "trend",
  "anomaly",
  "recommendation",
  "forecast",
  "score",
] as const;
