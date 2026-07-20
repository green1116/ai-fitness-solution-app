/**
 * E09-P6 — Global Agent Federation constants
 * BASE: enterprise-e09-p5-economy-freeze-v1
 */

export const E09_AGENT_ID =
  "enterprise-e09-global-agent-federation-v1" as const;

export const E09_AGENT_VERSION = "e09-agent-1" as const;
export const E09_AGENT_FREEZE_VERSION =
  "e09-agent-freeze-1" as const;

export const E09_AGENT_BASE =
  "enterprise-e09-p5-economy-freeze-v1" as const;

export const AGENT_ROLES = [
  "COORDINATOR",
  "WORKER",
  "OBSERVER",
  "SPECIALIST",
] as const;

export const AGENT_STATUSES = [
  "ACTIVE",
  "IDLE",
  "BUSY",
  "SUSPENDED",
] as const;

export const AGENT_TASK_KINDS = [
  "ANALYZE",
  "EXECUTE",
  "COORDINATE",
  "REPORT",
] as const;

export const AGENT_TASK_STATUSES = [
  "PENDING",
  "DISPATCHED",
  "RUNNING",
  "COMPLETED",
  "FAILED",
] as const;

export const AGENT_RUNTIME_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
