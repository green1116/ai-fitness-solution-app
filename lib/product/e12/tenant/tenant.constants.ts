/**
 * E12-P2 — SaaS Tenant Product Layer constants
 * BASE: enterprise-e12-p1-product-foundation-v1
 */

export const E12_TENANT_PRODUCT_ID =
  "enterprise-e12-saas-tenant-product-v1" as const;

export const E12_TENANT_PRODUCT_VERSION = "e12-tenant-1" as const;
export const E12_TENANT_PRODUCT_FREEZE_VERSION =
  "e12-tenant-product-freeze-1" as const;

export const E12_TENANT_PRODUCT_BASE =
  "enterprise-e12-p1-product-foundation-v1" as const;

export const E12_P2_TENANT_PRODUCT_FREEZE_VERSION =
  "e12-p2-saas-tenant-product-freeze-1" as const;

export const WORKSPACE_STATUSES = [
  "ACTIVE",
  "SUSPENDED",
  "ARCHIVED",
] as const;

export const PRODUCT_TENANT_STATUSES = [
  "PROVISIONING",
  "ACTIVE",
  "SUSPENDED",
  "CLOSED",
] as const;

export const SUBSCRIPTION_STATUSES = [
  "TRIAL",
  "ACTIVE",
  "PAST_DUE",
  "CANCELLED",
] as const;

export const ENTITLEMENT_STATUSES = [
  "GRANTED",
  "DENIED",
  "EXPIRED",
] as const;

export const ACCESS_DECISIONS = ["ALLOW", "DENY"] as const;

export const TENANT_PRODUCT_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
