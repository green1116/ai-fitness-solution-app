/**
 * Operations O1 — Customer Success Foundation constants
 * BASE: enterprise-launch-v1-release
 * Isolated namespace: lib/operations/o1
 */

export const OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_ID =
  "enterprise-operations-o1-customer-success-foundation-v1" as const;

export const OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_VERSION =
  "operations-o1-1" as const;

export const OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_FREEZE_VERSION =
  "operations-o1-customer-success-foundation-freeze-1" as const;

export const OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_BASE =
  "enterprise-launch-v1-release" as const;

export const OPERATIONS_O1_SUCCESS_FREEZE_VERSION =
  "operations-o1-customer-success-foundation-freeze-1" as const;

export const CUSTOMER_STATUSES = [
  "ONBOARDING",
  "ACTIVE",
  "AT_RISK",
  "CHURNED",
] as const;

export const HEALTH_BANDS = [
  "EXCELLENT",
  "GOOD",
  "FAIR",
  "POOR",
  "CRITICAL",
] as const;

export const SUCCESS_PLAN_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
] as const;

export const FEEDBACK_CHANNELS = [
  "SURVEY",
  "INTERVIEW",
  "SUPPORT",
  "NPS",
] as const;

export const RENEWAL_STATUSES = [
  "UPCOMING",
  "IN_PROGRESS",
  "COMMITTED",
  "AT_RISK",
  "LOST",
] as const;

export const O1_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const O1_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
