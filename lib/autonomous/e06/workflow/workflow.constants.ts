/**
 * E06-P3 — Autonomous Workflow Agent constants
 * BASE: enterprise-e06-p2-business-action-runtime-v1
 */

export const E06_WORKFLOW_AGENT_ID =
  "enterprise-e06-autonomous-workflow-agent-v1" as const;

export const E06_WORKFLOW_VERSION = "e06-workflow-1" as const;
export const E06_WORKFLOW_FREEZE_VERSION = "e06-workflow-freeze-1" as const;

export const E06_WORKFLOW_BASE =
  "enterprise-e06-p2-business-action-runtime-v1" as const;

export const WORKFLOW_GOAL_KINDS = [
  "respond",
  "guard",
  "escalate",
] as const;

/** Instance lifecycle: READY -> PLANNED -> RUNNING -> RESULT */
export const WORKFLOW_INSTANCE_PHASES = [
  "READY",
  "PLANNED",
  "RUNNING",
  "RESULT",
] as const;

export const WORKFLOW_INSTANCE_TRANSITIONS: ReadonlyArray<
  readonly [string, string]
> = [
  ["READY", "PLANNED"],
  ["PLANNED", "RUNNING"],
  ["RUNNING", "RESULT"],
] as const;

export const WORKFLOW_TRACE_EVENT_KINDS = [
  "ready",
  "plan",
  "step",
  "action",
  "result",
  "error",
] as const;
