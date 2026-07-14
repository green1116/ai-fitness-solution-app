/**
 * E04-P2 — Business Workflow Runtime constants
 * BASE: enterprise-e04-p1-business-agent-foundation-v1
 */

export const E04_WORKFLOW_RUNTIME_ID =
  "enterprise-e04-business-workflow-runtime-v1" as const;

export const E04_WORKFLOW_VERSION = "e04-workflow-1" as const;
export const E04_WORKFLOW_FREEZE_VERSION = "e04-workflow-freeze-1" as const;

export const E04_WORKFLOW_BASE =
  "enterprise-e04-p1-business-agent-foundation-v1" as const;

/** Instance lifecycle: READY -> RUNNING -> COMPLETED -> RESULT */
export const WORKFLOW_INSTANCE_PHASES = [
  "READY",
  "RUNNING",
  "COMPLETED",
  "RESULT",
] as const;

export const WORKFLOW_INSTANCE_TRANSITIONS: ReadonlyArray<
  readonly [string, string]
> = [
  ["READY", "RUNNING"],
  ["RUNNING", "COMPLETED"],
  ["COMPLETED", "RESULT"],
] as const;

export const WORKFLOW_STEP_STATUSES = [
  "pending",
  "running",
  "completed",
  "failed",
  "skipped",
] as const;

export const WORKFLOW_TRACE_EVENT_KINDS = [
  "ready",
  "running",
  "step",
  "completed",
  "result",
  "error",
] as const;
