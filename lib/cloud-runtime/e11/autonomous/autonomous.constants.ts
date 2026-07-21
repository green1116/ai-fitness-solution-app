/**
 * E11-P6 — Cloud Runtime Autonomous Operations constants
 * BASE: enterprise-e11-p5-cloud-runtime-observability-v1
 */

export const E11_AUTONOMOUS_ID =
  "enterprise-e11-cloud-runtime-autonomous-v1" as const;

export const E11_AUTONOMOUS_VERSION = "e11-autonomous-1" as const;
export const E11_AUTONOMOUS_FREEZE_VERSION =
  "e11-autonomous-freeze-1" as const;

export const E11_AUTONOMOUS_BASE =
  "enterprise-e11-p5-cloud-runtime-observability-v1" as const;

export const E11_P6_AUTONOMOUS_FREEZE_VERSION =
  "e11-p6-cloud-runtime-autonomous-freeze-1" as const;

export const AUTONOMOUS_OPERATION_KINDS = [
  "RECOVER",
  "HEAL",
  "OPTIMIZE",
  "INCIDENT",
  "PROBE",
] as const;

export const AUTONOMOUS_OPERATION_STATUSES = [
  "PENDING",
  "APPROVED",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
  "BLOCKED",
] as const;

export const INCIDENT_SEVERITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export const INCIDENT_STATUSES = [
  "OPEN",
  "ACKNOWLEDGED",
  "MITIGATING",
  "RESOLVED",
  "CLOSED",
] as const;

export const ACTION_POLICY_MODES = [
  "MANUAL",
  "ASSISTED",
  "AUTO",
] as const;

export const AUTONOMOUS_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
