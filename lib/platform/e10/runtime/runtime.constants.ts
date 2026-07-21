/**
 * E10-P2 — Platform Runtime constants
 * BASE: enterprise-e10-p1-platform-foundation-v1
 */

export const E10_RUNTIME_ID =
  "enterprise-e10-platform-runtime-v1" as const;

export const E10_RUNTIME_VERSION = "e10-runtime-1" as const;
export const E10_RUNTIME_FREEZE_VERSION =
  "e10-runtime-freeze-1" as const;

export const E10_RUNTIME_BASE =
  "enterprise-e10-p1-platform-foundation-v1" as const;

export const RUNTIME_SERVICE_KINDS = [
  "CORE",
  "WORKER",
  "MONITOR",
  "ADAPTER",
] as const;

export const RUNTIME_SERVICE_STATUSES = [
  "CREATED",
  "REGISTERED",
  "STARTING",
  "RUNNING",
  "STOPPING",
  "STOPPED",
  "FAILED",
] as const;

export const RUNTIME_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "DEGRADED",
  "STOPPED",
] as const;

export const RUNTIME_HEALTH_LEVELS = [
  "HEALTHY",
  "DEGRADED",
  "UNHEALTHY",
  "UNKNOWN",
] as const;
