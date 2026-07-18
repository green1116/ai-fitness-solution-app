/**
 * E07-P4 — Workforce Orchestration constants
 * BASE: enterprise-e07-p3-role-agent-marketplace-v1
 */

export const E07_ORCHESTRATION_ID =
  "enterprise-e07-workforce-orchestration-v1" as const;

export const E07_ORCHESTRATION_VERSION = "e07-orchestration-1" as const;
export const E07_ORCHESTRATION_FREEZE_VERSION =
  "e07-orchestration-freeze-1" as const;

export const E07_ORCHESTRATION_BASE =
  "enterprise-e07-p3-role-agent-marketplace-v1" as const;

export const ORCHESTRATION_KINDS = [
  "campaign",
  "guardrail",
  "handoff",
] as const;

/** Instance lifecycle: READY -> PLANNED -> RUNNING -> RESULT */
export const ORCHESTRATION_INSTANCE_PHASES = [
  "READY",
  "PLANNED",
  "RUNNING",
  "RESULT",
] as const;

export const ORCHESTRATION_INSTANCE_TRANSITIONS: ReadonlyArray<
  readonly [string, string]
> = [
  ["READY", "PLANNED"],
  ["PLANNED", "RUNNING"],
  ["RUNNING", "RESULT"],
] as const;

export const ORCHESTRATION_TRACE_EVENT_KINDS = [
  "ready",
  "plan",
  "step",
  "deploy",
  "result",
  "error",
] as const;
