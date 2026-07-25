/**
 * Product P1 — Customer Onboarding constants
 * BASE: enterprise-operations-complete-v1
 * Isolated namespace: lib/product/p1
 */

export const PRODUCT_P1_CUSTOMER_ONBOARDING_ID =
  "enterprise-product-p1-customer-onboarding-v1" as const;

export const PRODUCT_P1_CUSTOMER_ONBOARDING_VERSION =
  "product-p1-1" as const;

export const PRODUCT_P1_CUSTOMER_ONBOARDING_FREEZE_VERSION =
  "product-p1-customer-onboarding-freeze-1" as const;

export const PRODUCT_P1_CUSTOMER_ONBOARDING_BASE =
  "enterprise-operations-complete-v1" as const;

export const PRODUCT_P1_ONBOARDING_FREEZE_VERSION =
  "product-p1-customer-onboarding-freeze-1" as const;

export const ONBOARDING_STATUSES = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "BLOCKED",
  "COMPLETED",
  "CANCELLED",
] as const;

export const ONBOARDING_STEPS = [
  "INTAKE",
  "PROFILE",
  "WORKSPACE",
  "CHECKLIST",
  "ACTIVATION",
  "GO_LIVE",
] as const;

export const INTAKE_CHANNELS = [
  "SALES",
  "SELF_SERVE",
  "PARTNER",
  "MIGRATION",
] as const;

export const WORKSPACE_STATUSES = [
  "PENDING",
  "READY",
  "LIVE",
  "ARCHIVED",
] as const;

export const CHECKLIST_ITEM_STATUSES = [
  "PENDING",
  "PASSED",
  "FAILED",
  "SKIPPED",
] as const;

export const ACTIVATION_STATES = [
  "INACTIVE",
  "PENDING_ACTIVATION",
  "ACTIVE",
  "SUSPENDED",
] as const;

export const P1_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const P1_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
