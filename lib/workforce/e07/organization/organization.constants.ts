/**
 * E07-P7 — Autonomous Organization constants
 * BASE: enterprise-e07-p6-workforce-learning-loop-v1
 */

export const E07_ORGANIZATION_ID =
  "enterprise-e07-autonomous-organization-v1" as const;

export const E07_ORGANIZATION_VERSION = "e07-organization-1" as const;
export const E07_ORGANIZATION_FREEZE_VERSION =
  "e07-organization-freeze-1" as const;

export const E07_ORGANIZATION_BASE =
  "enterprise-e07-p6-workforce-learning-loop-v1" as const;

export const ORGANIZATION_KINDS = [
  "division",
  "program",
  "enterprise",
] as const;

/** Instance lifecycle: READY -> PLANNED -> RUNNING -> RESULT */
export const ORGANIZATION_INSTANCE_PHASES = [
  "READY",
  "PLANNED",
  "RUNNING",
  "RESULT",
] as const;

export const ORGANIZATION_INSTANCE_TRANSITIONS: ReadonlyArray<
  readonly [string, string]
> = [
  ["READY", "PLANNED"],
  ["PLANNED", "RUNNING"],
  ["RUNNING", "RESULT"],
] as const;

export const ORGANIZATION_TRACE_EVENT_KINDS = [
  "ready",
  "plan",
  "unit",
  "learn",
  "result",
  "error",
] as const;
