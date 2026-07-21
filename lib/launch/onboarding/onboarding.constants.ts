/**
 * Launch P2 — Customer Onboarding Layer constants
 * BASE: enterprise-launch-p1-production-deployment-foundation-v1
 */

export const LAUNCH_CUSTOMER_ONBOARDING_ID =
  "enterprise-launch-p2-customer-onboarding-v1" as const;

export const LAUNCH_CUSTOMER_ONBOARDING_VERSION = "launch-p2-1" as const;
export const LAUNCH_CUSTOMER_ONBOARDING_FREEZE_VERSION =
  "launch-customer-onboarding-freeze-1" as const;

export const LAUNCH_CUSTOMER_ONBOARDING_BASE =
  "enterprise-launch-p1-production-deployment-foundation-v1" as const;

export const LAUNCH_P2_ONBOARDING_FREEZE_VERSION =
  "launch-p2-customer-onboarding-freeze-1" as const;

export const ONBOARDING_PROFILE_STATUSES = [
  "DRAFT",
  "PROVISIONING",
  "CONFIGURING",
  "READY",
  "ACTIVATED",
  "FAILED",
] as const;

export const PROVISIONING_STEP_STATUSES = [
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "FAILED",
] as const;

export const PROVISIONING_STEPS = [
  "CREATE_WORKSPACE",
  "REGISTER_TENANT",
  "LINK_ORGANIZATION",
  "BIND_SUBSCRIPTION",
  "ACTIVATE_TENANT",
] as const;

export const ONBOARDING_CHECKLIST_ITEM_STATUSES = [
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

export const CUSTOMER_READINESS_VERDICTS = [
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
