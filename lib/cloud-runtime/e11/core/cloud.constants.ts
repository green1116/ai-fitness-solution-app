/**
 * E11-P1 — Cloud Runtime Foundation constants
 * BASE: enterprise-e10-autonomous-platform-complete-v1
 */

export const E11_CLOUD_RUNTIME_ID =
  "enterprise-e11-cloud-runtime-foundation-v1" as const;

export const E11_CLOUD_RUNTIME_VERSION = "e11-cloud-1" as const;
export const E11_CLOUD_RUNTIME_FREEZE_VERSION =
  "e11-cloud-freeze-1" as const;

export const E11_CLOUD_RUNTIME_BASE =
  "enterprise-e10-autonomous-platform-complete-v1" as const;

export const E11_P1_CLOUD_FREEZE_VERSION =
  "e11-p1-cloud-runtime-foundation-freeze-1" as const;

export const CLOUD_RUNTIME_KINDS = [
  "CORE",
  "WORKER",
  "ADAPTER",
  "MONITOR",
] as const;

export const CLOUD_RUNTIME_STATUSES = [
  "REGISTERED",
  "ACTIVE",
  "SUSPENDED",
  "STOPPED",
] as const;

/** Runtime lifecycle: created → registered → started → stopped | failed → removed */
export const CLOUD_LIFECYCLE_STAGES = [
  "created",
  "registered",
  "started",
  "stopped",
  "failed",
  "removed",
] as const;

export const CLOUD_LIFECYCLE_TRANSITIONS: ReadonlyArray<
  readonly [string, string]
> = [
  ["created", "registered"],
  ["registered", "started"],
  ["started", "stopped"],
  ["started", "failed"],
  ["failed", "stopped"],
  ["stopped", "started"],
  ["registered", "removed"],
  ["stopped", "removed"],
  ["failed", "removed"],
] as const;

export const CLOUD_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;

export const CLOUD_HEALTH_LEVELS = [
  "HEALTHY",
  "DEGRADED",
  "UNHEALTHY",
  "UNKNOWN",
] as const;

export const CLOUD_CONTEXT_STATUSES = [
  "OPEN",
  "ACTIVE",
  "CLOSED",
] as const;
