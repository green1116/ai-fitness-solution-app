/**
 * E12-P7 — Commercial Control Plane constants
 * BASE: enterprise-e12-p6-deployment-package-v1
 */

export const E12_COMMERCIAL_CONTROL_ID =
  "enterprise-e12-commercial-control-plane-v1" as const;

export const E12_COMMERCIAL_CONTROL_VERSION = "e12-commercial-1" as const;
export const E12_COMMERCIAL_CONTROL_FREEZE_VERSION =
  "e12-commercial-control-freeze-1" as const;

export const E12_COMMERCIAL_CONTROL_BASE =
  "enterprise-e12-p6-deployment-package-v1" as const;

export const E12_P7_COMMERCIAL_CONTROL_FREEZE_VERSION =
  "e12-p7-commercial-control-plane-freeze-1" as const;

export const PRODUCT_OPERATION_KINDS = [
  "ONBOARD",
  "EXPAND",
  "RENEW",
  "CHURN",
  "SUPPORT",
] as const;

export const PRODUCT_OPERATION_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CANCELLED",
] as const;

export const CUSTOMER_LIFECYCLE_STAGES = [
  "PROSPECT",
  "ONBOARDING",
  "ACTIVE",
  "AT_RISK",
  "CHURNED",
] as const;

export const COMMERCIAL_POLICY_KINDS = [
  "PRICING",
  "DISCOUNT",
  "SLA",
  "QUOTA",
  "COMPLIANCE",
] as const;

export const COMMERCIAL_POLICY_STATUSES = [
  "ACTIVE",
  "SUSPENDED",
  "ARCHIVED",
] as const;

export const SLA_TIERS = ["STANDARD", "PREMIUM", "ENTERPRISE"] as const;

export const SLA_STATUSES = ["ACTIVE", "BREACHED", "SUSPENDED"] as const;

export const COMMERCIAL_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
