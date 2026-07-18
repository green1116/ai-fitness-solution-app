/**
 * E08-P5 — Ecosystem Intelligence constants
 * BASE: enterprise-e08-p4-cross-enterprise-workflow-v1
 */

export const E08_INTELLIGENCE_ID =
  "enterprise-e08-ecosystem-intelligence-v1" as const;

export const E08_INTELLIGENCE_VERSION = "e08-intelligence-1" as const;
export const E08_INTELLIGENCE_FREEZE_VERSION =
  "e08-intelligence-freeze-1" as const;

export const E08_INTELLIGENCE_BASE =
  "enterprise-e08-p4-cross-enterprise-workflow-v1" as const;

export const INTELLIGENCE_KINDS = [
  "coverage",
  "expansion",
  "coherence",
] as const;

/** Intelligence lifecycle: READY -> ANALYZE -> INSIGHT -> RESULT */
export const INTELLIGENCE_INSTANCE_PHASES = [
  "READY",
  "ANALYZE",
  "INSIGHT",
  "RESULT",
] as const;

export const INTELLIGENCE_INSTANCE_TRANSITIONS: ReadonlyArray<
  readonly [string, string]
> = [
  ["READY", "ANALYZE"],
  ["ANALYZE", "INSIGHT"],
  ["INSIGHT", "RESULT"],
] as const;

export const INTELLIGENCE_TRACE_EVENT_KINDS = [
  "ready",
  "analyze",
  "insight",
  "result",
  "error",
] as const;
