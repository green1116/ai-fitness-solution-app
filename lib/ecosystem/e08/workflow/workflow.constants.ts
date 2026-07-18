/**
 * E08-P4 — Cross Enterprise Workflow constants
 * BASE: enterprise-e08-p3-ai-partner-exchange-v1
 */

export const E08_WORKFLOW_ID =
  "enterprise-e08-cross-enterprise-workflow-v1" as const;

export const E08_WORKFLOW_VERSION = "e08-workflow-1" as const;
export const E08_WORKFLOW_FREEZE_VERSION =
  "e08-workflow-freeze-1" as const;

export const E08_WORKFLOW_BASE =
  "enterprise-e08-p3-ai-partner-exchange-v1" as const;

export const WORKFLOW_KINDS = [
  "fulfill",
  "expand",
  "handoff",
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
  "exchange",
  "result",
  "error",
] as const;
