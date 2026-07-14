/**
 * E04-P3 — Business Process Orchestration constants
 * BASE: enterprise-e04-p2-business-workflow-runtime-v1
 */

export const E04_PROCESS_ORCHESTRATION_ID =
  "enterprise-e04-business-process-orchestration-v1" as const;

export const E04_PROCESS_VERSION = "e04-process-1" as const;
export const E04_PROCESS_FREEZE_VERSION = "e04-process-freeze-1" as const;

export const E04_PROCESS_BASE =
  "enterprise-e04-p2-business-workflow-runtime-v1" as const;

/** Instance lifecycle: READY -> RUNNING -> COMPLETED -> RESULT */
export const PROCESS_INSTANCE_PHASES = [
  "READY",
  "RUNNING",
  "COMPLETED",
  "RESULT",
] as const;

export const PROCESS_INSTANCE_TRANSITIONS: ReadonlyArray<
  readonly [string, string]
> = [
  ["READY", "RUNNING"],
  ["RUNNING", "COMPLETED"],
  ["COMPLETED", "RESULT"],
] as const;

export const PROCESS_NODE_STATUSES = [
  "pending",
  "running",
  "completed",
  "failed",
  "skipped",
] as const;
