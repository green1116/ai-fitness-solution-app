/**
 * Commercialization P5 — Delivery Operations Foundation constants
 * BASE: enterprise-commercialization-p4-customer-onboarding-foundation-v1
 * Isolated namespace: lib/commercialization/p5
 */

export const COMMERCIALIZATION_DELIVERY_OPERATIONS_ID =
  "enterprise-commercialization-p5-delivery-operations-foundation-v1" as const;

export const COMMERCIALIZATION_DELIVERY_OPERATIONS_VERSION =
  "commercialization-p5-1" as const;

export const COMMERCIALIZATION_DELIVERY_OPERATIONS_FREEZE_VERSION =
  "commercialization-delivery-operations-foundation-freeze-1" as const;

export const COMMERCIALIZATION_DELIVERY_OPERATIONS_BASE =
  "enterprise-commercialization-p4-customer-onboarding-foundation-v1" as const;

export const COMMERCIALIZATION_P5_DELIVERY_FREEZE_VERSION =
  "commercialization-p5-delivery-operations-foundation-freeze-1" as const;

export const PROJECT_STATUSES = [
  "PLANNED",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED",
] as const;

export const DELIVERY_STATUSES = [
  "DRAFT",
  "SCHEDULED",
  "IN_FLIGHT",
  "DELIVERED",
  "FAILED",
] as const;

export const DELIVERY_PHASES = [
  "KICKOFF",
  "BUILD",
  "VALIDATE",
  "RELEASE",
  "CLOSEOUT",
] as const;

export const EXECUTION_STATUSES = [
  "QUEUED",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
  "CANCELLED",
] as const;

export const ARTIFACT_KINDS = [
  "DOCUMENT",
  "PACKAGE",
  "CONFIG",
  "REPORT",
  "MEDIA",
] as const;

export const ARTIFACT_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "SUPERSEDED",
  "ARCHIVED",
] as const;

export const QUALITY_CHECK_KINDS = [
  "FUNCTIONAL",
  "SECURITY",
  "PERFORMANCE",
  "COMPLIANCE",
] as const;

export const ACCEPTANCE_VERDICTS = [
  "ACCEPTED",
  "REJECTED",
  "CONDITIONAL",
] as const;

export const DELIVERY_OPS_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const DELIVERY_OPS_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
