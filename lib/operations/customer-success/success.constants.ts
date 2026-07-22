/**
 * Post-Launch P2 — Customer Success Operations constants
 * BASE: enterprise-post-launch-p1-production-operations-foundation-v1
 */

export const OPERATIONS_CUSTOMER_SUCCESS_ID =
  "enterprise-post-launch-p2-customer-success-operations-v1" as const;

export const OPERATIONS_CUSTOMER_SUCCESS_VERSION = "operations-p2-1" as const;
export const OPERATIONS_CUSTOMER_SUCCESS_FREEZE_VERSION =
  "operations-customer-success-freeze-1" as const;

export const OPERATIONS_CUSTOMER_SUCCESS_BASE =
  "enterprise-post-launch-p1-production-operations-foundation-v1" as const;

export const OPERATIONS_P2_CUSTOMER_SUCCESS_FREEZE_VERSION =
  "operations-p2-customer-success-operations-freeze-1" as const;

export const CUSTOMER_HEALTH_LEVELS = [
  "HEALTHY",
  "STABLE",
  "AT_RISK",
  "CRITICAL",
  "UNKNOWN",
] as const;

export const ADOPTION_STAGES = [
  "AWARE",
  "TRIAL",
  "ADOPTING",
  "ADOPTED",
  "EXPANDING",
] as const;

export const SUCCESS_WORKFLOW_STEPS = [
  "ASSESS_HEALTH",
  "TRACK_ADOPTION",
  "ENGAGE",
  "OPERATE_LIFECYCLE",
  "VALIDATE_SUCCESS",
] as const;

export const SUCCESS_STEP_STATUSES = [
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "SKIPPED",
] as const;

export const CUSTOMER_SUCCESS_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const CUSTOMER_SUCCESS_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
