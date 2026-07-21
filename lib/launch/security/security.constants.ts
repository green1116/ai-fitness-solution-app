/**
 * Launch P4 — Security Readiness Layer constants
 * BASE: enterprise-launch-p3-demo-environment-v1
 */

export const LAUNCH_SECURITY_READINESS_ID =
  "enterprise-launch-p4-security-readiness-v1" as const;

export const LAUNCH_SECURITY_READINESS_VERSION = "launch-p4-1" as const;
export const LAUNCH_SECURITY_READINESS_FREEZE_VERSION =
  "launch-security-readiness-freeze-1" as const;

export const LAUNCH_SECURITY_READINESS_BASE =
  "enterprise-launch-p3-demo-environment-v1" as const;

export const LAUNCH_P4_SECURITY_FREEZE_VERSION =
  "launch-p4-security-readiness-freeze-1" as const;

export const SECURITY_PROFILE_STATUSES = [
  "DRAFT",
  "IN_REVIEW",
  "APPROVED",
  "BLOCKED",
  "ARCHIVED",
] as const;

export const ACCESS_REVIEW_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "PASSED",
  "FAILED",
] as const;

export const ACCESS_REVIEW_TARGETS = [
  "ADMIN_PERMISSION",
  "API_ACCESS",
  "ROLE_ASSIGNMENT",
] as const;

export const COMPLIANCE_CHECK_IDS = [
  "platform.baseline",
  "admin.permission.review",
  "api.access.control",
  "audit.trail.present",
  "least.privilege",
  "secret.handling",
] as const;

export const COMPLIANCE_ITEM_STATUSES = [
  "PENDING",
  "PASS",
  "FAIL",
  "WAIVED",
] as const;

export const AUDIT_VALIDATION_STATUSES = [
  "PENDING",
  "VALID",
  "INVALID",
  "INCOMPLETE",
] as const;

export const SECURITY_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const SECURITY_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
