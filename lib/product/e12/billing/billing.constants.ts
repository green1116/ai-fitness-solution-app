/**
 * E12-P4 — Billing & Commercial Layer constants
 * BASE: enterprise-e12-p3-enterprise-admin-console-v1
 */

export const E12_BILLING_COMMERCIAL_ID =
  "enterprise-e12-billing-commercial-v1" as const;

export const E12_BILLING_COMMERCIAL_VERSION = "e12-billing-1" as const;
export const E12_BILLING_COMMERCIAL_FREEZE_VERSION =
  "e12-billing-commercial-freeze-1" as const;

export const E12_BILLING_COMMERCIAL_BASE =
  "enterprise-e12-p3-enterprise-admin-console-v1" as const;

export const E12_P4_BILLING_COMMERCIAL_FREEZE_VERSION =
  "e12-p4-billing-commercial-freeze-1" as const;

export const PRICING_PLAN_STATUSES = [
  "ACTIVE",
  "DEPRECATED",
  "ARCHIVED",
] as const;

export const BILLING_CYCLES = ["MONTHLY", "ANNUAL"] as const;

export const USAGE_METER_UNITS = [
  "REQUEST",
  "RUNTIME_HOUR",
  "TENANT",
  "STORAGE_GB",
] as const;

export const BILLING_SUBSCRIPTION_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "PAST_DUE",
  "CANCELLED",
  "EXPIRED",
] as const;

export const BILLING_LIFECYCLE_EVENTS = [
  "CREATED",
  "ACTIVATED",
  "RENEWED",
  "PAST_DUE",
  "CANCELLED",
  "EXPIRED",
] as const;

export const QUOTA_BILLING_STATUSES = [
  "WITHIN_QUOTA",
  "OVERAGE",
  "SUSPENDED",
] as const;

export const INVOICE_STATUSES = [
  "DRAFT",
  "ISSUED",
  "PAID",
  "VOID",
] as const;

export const BILLING_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
