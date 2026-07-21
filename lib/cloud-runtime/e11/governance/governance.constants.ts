/**
 * E11-P4 — Cloud Runtime Resource Governance constants
 * BASE: enterprise-e11-p3-cloud-runtime-multi-tenant-isolation-v1
 */

export const E11_GOVERNANCE_ID =
  "enterprise-e11-cloud-runtime-governance-v1" as const;

export const E11_GOVERNANCE_VERSION = "e11-governance-1" as const;
export const E11_GOVERNANCE_FREEZE_VERSION =
  "e11-governance-freeze-1" as const;

export const E11_GOVERNANCE_BASE =
  "enterprise-e11-p3-cloud-runtime-multi-tenant-isolation-v1" as const;

export const E11_P4_GOVERNANCE_FREEZE_VERSION =
  "e11-p4-cloud-runtime-governance-freeze-1" as const;

export const GOVERNANCE_RESOURCE_TYPES = [
  "CPU",
  "MEMORY",
  "SLOT",
  "BANDWIDTH",
] as const;

export const ALLOCATION_STATUSES = [
  "ACTIVE",
  "RELEASED",
  "DENIED",
] as const;

export const WORKLOAD_PRIORITIES = [
  "LOW",
  "NORMAL",
  "HIGH",
  "CRITICAL",
] as const;

export const THROTTLE_MODES = [
  "OFF",
  "SOFT",
  "HARD",
] as const;

export const ADMISSION_DECISIONS = [
  "ADMIT",
  "REJECT",
  "THROTTLE",
] as const;

export const GOVERNANCE_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
