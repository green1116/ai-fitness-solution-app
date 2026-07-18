/**
 * E07-P2 — AI Employee Runtime constants
 * BASE: enterprise-e07-p1-digital-workforce-foundation-v1
 */

export const E07_EMPLOYEE_RUNTIME_ID =
  "enterprise-e07-ai-employee-runtime-v1" as const;

export const E07_EMPLOYEE_VERSION = "e07-employee-1" as const;
export const E07_EMPLOYEE_FREEZE_VERSION =
  "e07-employee-freeze-1" as const;

export const E07_EMPLOYEE_BASE =
  "enterprise-e07-p1-digital-workforce-foundation-v1" as const;

export const EMPLOYEE_JOB_KINDS = [
  "specialist",
  "supervisor",
  "manager",
] as const;

/** Instance lifecycle: READY -> PLANNED -> WORKING -> RESULT */
export const EMPLOYEE_INSTANCE_PHASES = [
  "READY",
  "PLANNED",
  "WORKING",
  "RESULT",
] as const;

export const EMPLOYEE_INSTANCE_TRANSITIONS: ReadonlyArray<
  readonly [string, string]
> = [
  ["READY", "PLANNED"],
  ["PLANNED", "WORKING"],
  ["WORKING", "RESULT"],
] as const;

export const EMPLOYEE_TRACE_EVENT_KINDS = [
  "ready",
  "plan",
  "task",
  "worker",
  "result",
  "error",
] as const;
