/**
 * E06-P4 — Enterprise Control Plane constants
 * BASE: enterprise-e06-p3-autonomous-workflow-agent-v1
 */

export const E06_CONTROL_PLANE_ID =
  "enterprise-e06-enterprise-control-plane-v1" as const;

export const E06_CONTROL_VERSION = "e06-control-1" as const;
export const E06_CONTROL_FREEZE_VERSION = "e06-control-freeze-1" as const;

export const E06_CONTROL_BASE =
  "enterprise-e06-p3-autonomous-workflow-agent-v1" as const;

export const CONTROL_MODES = [
  "automatic",
  "supervised",
  "fallback",
] as const;

export const CONTROL_HEALTH_STATUSES = ["green", "amber", "red"] as const;

/** Plan lifecycle: READY -> SCHEDULED -> RUNNING -> RESULT */
export const CONTROL_PLAN_PHASES = [
  "READY",
  "SCHEDULED",
  "RUNNING",
  "RESULT",
] as const;

export const CONTROL_PLAN_TRANSITIONS: ReadonlyArray<
  readonly [string, string]
> = [
  ["READY", "SCHEDULED"],
  ["SCHEDULED", "RUNNING"],
  ["RUNNING", "RESULT"],
] as const;

export const CONTROL_TRACE_EVENT_KINDS = [
  "ready",
  "schedule",
  "dispatch",
  "health",
  "result",
  "error",
] as const;
