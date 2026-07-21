/**
 * E10-P7 — Enterprise Platform OS constants
 * BASE: enterprise-e10-p6-platform-marketplace-v1
 */

export const E10_OS_ID = "enterprise-e10-platform-os-v1" as const;

export const E10_OS_VERSION = "e10-os-1" as const;
export const E10_OS_FREEZE_VERSION = "e10-os-freeze-1" as const;

export const E10_OS_BASE =
  "enterprise-e10-p6-platform-marketplace-v1" as const;

/** Built-in platform components (P1–P6). No new subsystem. */
export const OS_COMPONENT_KINDS = [
  "FOUNDATION",
  "RUNTIME",
  "RESOURCE",
  "EVENT",
  "GATEWAY",
  "MARKETPLACE",
] as const;

/**
 * Fixed startup order (dependency chain P1 → P6).
 * Shutdown uses reverse order.
 */
export const OS_BOOT_ORDER = [
  "FOUNDATION",
  "RUNTIME",
  "RESOURCE",
  "EVENT",
  "GATEWAY",
  "MARKETPLACE",
] as const;

export const OS_COMPONENT_STATUSES = [
  "REGISTERED",
  "STARTING",
  "RUNNING",
  "STOPPING",
  "STOPPED",
  "FAILED",
] as const;

export const OS_KERNEL_STATUSES = [
  "IDLE",
  "BOOTING",
  "READY",
  "RUNNING",
  "STOPPING",
  "STOPPED",
] as const;

export const OS_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;

export const OS_HEALTH_LEVELS = [
  "HEALTHY",
  "DEGRADED",
  "UNHEALTHY",
  "UNKNOWN",
] as const;
