/**
 * Commercialization P4 — Customer Onboarding Foundation constants
 * BASE: enterprise-commercialization-p3-pricing-contract-foundation-v1
 * Isolated namespace: lib/commercialization/p4
 */

export const COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID =
  "enterprise-commercialization-p4-customer-onboarding-foundation-v1" as const;

export const COMMERCIALIZATION_CUSTOMER_ONBOARDING_VERSION =
  "commercialization-p4-1" as const;

export const COMMERCIALIZATION_CUSTOMER_ONBOARDING_FREEZE_VERSION =
  "commercialization-customer-onboarding-foundation-freeze-1" as const;

export const COMMERCIALIZATION_CUSTOMER_ONBOARDING_BASE =
  "enterprise-commercialization-p3-pricing-contract-foundation-v1" as const;

export const COMMERCIALIZATION_P4_ONBOARDING_FREEZE_VERSION =
  "commercialization-p4-customer-onboarding-foundation-freeze-1" as const;

export const ACCOUNT_STATUSES = [
  "PROSPECT",
  "PROVISIONING",
  "ACTIVE",
  "SUSPENDED",
  "CLOSED",
] as const;

export const ONBOARDING_STATUSES = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "BLOCKED",
  "COMPLETED",
  "CANCELLED",
] as const;

export const ONBOARDING_STEPS = [
  "INTAKE",
  "REQUIREMENTS",
  "WORKSPACE",
  "HANDOFF",
  "GO_LIVE",
] as const;

export const WORKSPACE_STATUSES = [
  "PENDING",
  "READY",
  "LIVE",
  "ARCHIVED",
] as const;

export const INTAKE_CHANNELS = [
  "SALES",
  "SELF_SERVE",
  "PARTNER",
  "MIGRATION",
] as const;

export const REQUIREMENT_PRIORITIES = [
  "P1",
  "P2",
  "P3",
  "P4",
] as const;

export const HANDOFF_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "COMPLETE",
] as const;

export const ONBOARDING_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const ONBOARDING_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
