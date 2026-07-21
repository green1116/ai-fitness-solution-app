/**
 * E10-P3 — Platform Resource Manager constants
 * BASE: enterprise-e10-p2-platform-runtime-v1
 */

export const E10_RESOURCE_ID =
  "enterprise-e10-platform-resource-v1" as const;

export const E10_RESOURCE_VERSION = "e10-resource-1" as const;
export const E10_RESOURCE_FREEZE_VERSION =
  "e10-resource-freeze-1" as const;

export const E10_RESOURCE_BASE =
  "enterprise-e10-p2-platform-runtime-v1" as const;

export const RESOURCE_TYPES = [
  "CPU",
  "MEMORY",
  "STORAGE",
  "NETWORK",
  "SLOT",
] as const;

export const RESOURCE_POOL_STATUSES = [
  "OPEN",
  "DRAINING",
  "CLOSED",
] as const;

export const ALLOCATION_STATUSES = [
  "ACTIVE",
  "RELEASED",
  "DENIED",
] as const;

export const RESOURCE_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
