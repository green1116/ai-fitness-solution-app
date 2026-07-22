/**
 * Post-Launch P1 — Production Operations Foundation constants
 * BASE: enterprise-launch-complete-v1
 */

export const OPERATIONS_PRODUCTION_FOUNDATION_ID =
  "enterprise-post-launch-p1-production-operations-foundation-v1" as const;

export const OPERATIONS_PRODUCTION_FOUNDATION_VERSION =
  "operations-p1-1" as const;
export const OPERATIONS_PRODUCTION_FOUNDATION_FREEZE_VERSION =
  "operations-production-foundation-freeze-1" as const;

export const OPERATIONS_PRODUCTION_FOUNDATION_BASE =
  "enterprise-launch-complete-v1" as const;

export const OPERATIONS_P1_PRODUCTION_FREEZE_VERSION =
  "operations-p1-production-operations-foundation-freeze-1" as const;

export const PRODUCTION_OPERATION_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEGRADED",
  "SUSPENDED",
  "RETIRED",
] as const;

export const OPERATIONAL_STATUS_LEVELS = [
  "NOMINAL",
  "WATCH",
  "DEGRADED",
  "CRITICAL",
  "UNKNOWN",
] as const;

export const OPERATION_CHECKLIST_IDS = [
  "launch.baseline",
  "control.plane",
  "cloud.health",
  "observability",
  "sla.support",
  "metrics.capture",
] as const;

export const OPERATION_CHECKLIST_ITEM_STATUSES = [
  "PENDING",
  "PASS",
  "FAIL",
  "WAIVED",
] as const;

export const OPERATIONS_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const OPERATIONS_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
