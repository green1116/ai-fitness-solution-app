/**
 * E11-P2 — Cloud Runtime Execution Layer constants
 * BASE: enterprise-e11-p1-cloud-runtime-foundation-v1
 */

export const E11_EXECUTION_ID =
  "enterprise-e11-cloud-runtime-execution-v1" as const;

export const E11_EXECUTION_VERSION = "e11-execution-1" as const;
export const E11_EXECUTION_FREEZE_VERSION =
  "e11-execution-freeze-1" as const;

export const E11_EXECUTION_BASE =
  "enterprise-e11-p1-cloud-runtime-foundation-v1" as const;

export const E11_P2_EXECUTION_FREEZE_VERSION =
  "e11-p2-cloud-runtime-execution-freeze-1" as const;

export const EXECUTION_TASK_KINDS = [
  "JOB",
  "INVOKE",
  "BATCH",
  "PROBE",
] as const;

export const EXECUTION_TASK_STATUSES = [
  "PENDING",
  "QUEUED",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
] as const;

export const EXECUTION_RESULT_STATUSES = [
  "OK",
  "ERROR",
  "CANCELLED",
] as const;

export const EXECUTION_TRACE_EVENTS = [
  "created",
  "enqueued",
  "dequeued",
  "started",
  "completed",
  "failed",
  "cancelled",
] as const;

export const EXECUTION_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;

export const EXECUTION_PRIORITIES = [
  "LOW",
  "NORMAL",
  "HIGH",
  "CRITICAL",
] as const;
