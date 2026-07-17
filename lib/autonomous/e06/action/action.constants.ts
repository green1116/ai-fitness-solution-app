/**
 * E06-P2 — Business Action Runtime constants
 * BASE: enterprise-e06-p1-autonomous-operation-foundation-v1
 */

export const E06_ACTION_RUNTIME_ID =
  "enterprise-e06-business-action-runtime-v1" as const;

export const E06_ACTION_VERSION = "e06-action-1" as const;
export const E06_ACTION_FREEZE_VERSION = "e06-action-freeze-1" as const;

export const E06_ACTION_BASE =
  "enterprise-e06-p1-autonomous-operation-foundation-v1" as const;

/** Instance lifecycle: READY -> RUNNING -> COMPLETED -> RESULT */
export const ACTION_INSTANCE_PHASES = [
  "READY",
  "RUNNING",
  "COMPLETED",
  "RESULT",
] as const;

export const ACTION_INSTANCE_TRANSITIONS: ReadonlyArray<
  readonly [string, string]
> = [
  ["READY", "RUNNING"],
  ["RUNNING", "COMPLETED"],
  ["COMPLETED", "RESULT"],
] as const;

export const ACTION_KINDS = [
  "notify",
  "dispatch",
  "adjust",
  "verify",
  "report",
  "orchestrate",
] as const;

export const ACTION_TRACE_EVENT_KINDS = [
  "ready",
  "policy",
  "operation",
  "effect",
  "result",
  "error",
] as const;
