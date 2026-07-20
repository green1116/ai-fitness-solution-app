/**
 * E09-P7 — Enterprise Civilization OS constants
 * BASE: enterprise-e09-p6-agent-freeze-v1
 */

export const E09_CIVILIZATION_ID =
  "enterprise-e09-enterprise-civilization-os-v1" as const;

export const E09_CIVILIZATION_VERSION = "e09-civilization-1" as const;
export const E09_CIVILIZATION_FREEZE_VERSION =
  "e09-civilization-freeze-1" as const;

export const E09_CIVILIZATION_BASE =
  "enterprise-e09-p6-agent-freeze-v1" as const;

export const CIVILIZATION_STAGES = [
  "NASCENT",
  "FORMING",
  "OPERATING",
  "EXPANDING",
  "MATURE",
] as const;

export const CIVILIZATION_STATUSES = [
  "ACTIVE",
  "SYNCING",
  "SUSPENDED",
  "ARCHIVED",
] as const;

export const ORCHESTRATION_MODES = [
  "REGIONAL",
  "MARKET",
  "FEDERATED",
  "ECONOMIC",
  "AGENTIC",
  "UNIFIED",
] as const;

export const CIVILIZATION_RUNTIME_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
