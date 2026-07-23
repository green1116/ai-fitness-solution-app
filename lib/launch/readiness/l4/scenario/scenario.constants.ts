/**
 * Launch L4 — Enterprise Delivery Validation constants
 * BASE: enterprise-launch-l3-production-hardening-v1
 * Isolated namespace: lib/launch/readiness/l4
 */

export const LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_ID =
  "enterprise-launch-l4-enterprise-delivery-validation-v1" as const;

export const LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_VERSION =
  "launch-l4-1" as const;

export const LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_FREEZE_VERSION =
  "launch-l4-enterprise-delivery-validation-freeze-1" as const;

export const LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_BASE =
  "enterprise-launch-l3-production-hardening-v1" as const;

export const LAUNCH_L4_VALIDATION_FREEZE_VERSION =
  "launch-l4-enterprise-delivery-validation-freeze-1" as const;

export const SCENARIO_KINDS = [
  "SMOKE",
  "REGRESSION",
  "UAT",
  "CUTOVER",
] as const;

export const WORKFLOW_STEP_STATUSES = [
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "FAILED",
] as const;

export const VALIDATION_CHECK_RESULTS = [
  "PASS",
  "WARN",
  "FAIL",
] as const;

export const ARTIFACT_VERIFY_RESULTS = [
  "VALID",
  "INVALID",
  "MISSING",
] as const;

export const DELIVERY_ACCEPTANCE_VERDICTS = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "CONDITIONAL",
] as const;

export const DELIVERY_STATUSES = [
  "PLANNED",
  "IN_PROGRESS",
  "VALIDATED",
  "ACCEPTED",
  "BLOCKED",
] as const;

export const L4_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const L4_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
