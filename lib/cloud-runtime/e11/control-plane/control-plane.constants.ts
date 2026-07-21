/**
 * E11-P7 — Cloud Runtime Enterprise Control Plane constants
 * BASE: enterprise-e11-p6-cloud-runtime-autonomous-operations-v1
 */

export const E11_CONTROL_PLANE_ID =
  "enterprise-e11-cloud-runtime-control-plane-v1" as const;

export const E11_CONTROL_PLANE_VERSION = "e11-control-plane-1" as const;
export const E11_CONTROL_PLANE_FREEZE_VERSION =
  "e11-control-plane-freeze-1" as const;

export const E11_CONTROL_PLANE_BASE =
  "enterprise-e11-p6-cloud-runtime-autonomous-operations-v1" as const;

export const E11_P7_CONTROL_PLANE_FREEZE_VERSION =
  "e11-p7-cloud-runtime-control-plane-freeze-1" as const;

export const CONTROL_PLANE_SCOPES = [
  "GLOBAL",
  "ORGANIZATION",
  "TENANT",
  "RUNTIME",
] as const;

export const CONTROL_PLANE_STATUSES = [
  "ACTIVE",
  "SUSPENDED",
  "ARCHIVED",
] as const;

export const CONTROL_COMMAND_KINDS = [
  "ORCHESTRATE",
  "RECOVER",
  "HEAL",
  "OPTIMIZE",
  "ADMIT",
  "EXECUTE",
  "COMPLIANCE_SCAN",
  "SNAPSHOT",
] as const;

export const CONTROL_COMMAND_STATUSES = [
  "PENDING",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
  "DENIED",
] as const;

export const GLOBAL_POLICY_KINDS = [
  "ADMISSION",
  "ISOLATION",
  "AUTONOMOUS",
  "GOVERNANCE",
  "COMPLIANCE",
] as const;

export const GLOBAL_POLICY_ENFORCEMENT = [
  "ENFORCE",
  "AUDIT",
  "DISABLED",
] as const;

export const COMPLIANCE_STATES = [
  "COMPLIANT",
  "WARNING",
  "NON_COMPLIANT",
  "UNKNOWN",
] as const;

export const ORCHESTRATION_ACTIONS = [
  "START",
  "STOP",
  "RECOVER",
  "REBALANCE",
  "DRAIN",
] as const;

export const CONTROL_PLANE_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
