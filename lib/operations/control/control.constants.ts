/**
 * Post-Launch P7 — Operations Control Plane constants
 * BASE: enterprise-post-launch-p6-enterprise-support-operations-v1
 */

export const OPERATIONS_CONTROL_PLANE_ID =
  "enterprise-post-launch-p7-operations-control-plane-v1" as const;

export const OPERATIONS_CONTROL_PLANE_VERSION = "operations-p7-1" as const;
export const OPERATIONS_CONTROL_PLANE_FREEZE_VERSION =
  "operations-control-plane-freeze-1" as const;

export const OPERATIONS_CONTROL_PLANE_BASE =
  "enterprise-post-launch-p6-enterprise-support-operations-v1" as const;

export const OPERATIONS_P7_CONTROL_FREEZE_VERSION =
  "operations-p7-operations-control-plane-freeze-1" as const;

export const OPS_ORCHESTRATION_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEGRADED",
  "PAUSED",
  "COMPLETED",
] as const;

export const OPS_ORCHESTRATION_DOMAINS = [
  "PRODUCTION",
  "CUSTOMER_SUCCESS",
  "INCIDENT",
  "RELEASE",
  "GROWTH",
  "SUPPORT",
] as const;

export const DOMAIN_HEALTH_LEVELS = [
  "HEALTHY",
  "WATCH",
  "DEGRADED",
  "CRITICAL",
  "UNKNOWN",
] as const;

export const OPS_DECISION_VERDICTS = [
  "GO",
  "HOLD",
  "NO_GO",
  "ESCALATE",
] as const;

export const COMMAND_CENTER_MODES = [
  "MONITOR",
  "RESPOND",
  "STEADY",
  "LOCKDOWN",
] as const;

export const OPS_CONTROL_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const OPS_CONTROL_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
