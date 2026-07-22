/**
 * Post-Launch P4 — Release Management Operations constants
 * BASE: enterprise-post-launch-p3-incident-response-operations-v1
 */

export const OPERATIONS_RELEASE_MANAGEMENT_ID =
  "enterprise-post-launch-p4-release-management-operations-v1" as const;

export const OPERATIONS_RELEASE_MANAGEMENT_VERSION = "operations-p4-1" as const;
export const OPERATIONS_RELEASE_MANAGEMENT_FREEZE_VERSION =
  "operations-release-management-freeze-1" as const;

export const OPERATIONS_RELEASE_MANAGEMENT_BASE =
  "enterprise-post-launch-p3-incident-response-operations-v1" as const;

export const OPERATIONS_P4_RELEASE_MANAGEMENT_FREEZE_VERSION =
  "operations-p4-release-management-operations-freeze-1" as const;

export const RELEASE_LIFECYCLE_STATUSES = [
  "DRAFT",
  "PLANNED",
  "APPROVED",
  "DEPLOYING",
  "RELEASED",
  "ROLLED_BACK",
  "FAILED",
] as const;

export const RELEASE_VERSION_KINDS = [
  "MAJOR",
  "MINOR",
  "PATCH",
  "HOTFIX",
] as const;

export const DEPLOYMENT_APPROVAL_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "EXPIRED",
] as const;

export const ROLLBACK_WORKFLOW_STEPS = [
  "DETECT_ISSUE",
  "ASSESS_IMPACT",
  "APPROVE_ROLLBACK",
  "EXECUTE_ROLLBACK",
  "VALIDATE_STABLE",
] as const;

export const ROLLBACK_STEP_STATUSES = [
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "SKIPPED",
] as const;

export const RELEASE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const RELEASE_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
