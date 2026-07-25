/**
 * Product Admin — Admin Foundation constants
 * MODULE: Admin
 * BASE: enterprise-product-analytics-baseline-v1
 * Isolated namespace: lib/product/admin
 */

export const PRODUCT_ADMIN_FOUNDATION_ID =
  "enterprise-product-admin-foundation-v1" as const;

export const PRODUCT_ADMIN_FOUNDATION_VERSION =
  "product-admin-1" as const;

export const PRODUCT_ADMIN_FOUNDATION_FREEZE_VERSION =
  "product-admin-foundation-freeze-1" as const;

export const PRODUCT_ADMIN_FOUNDATION_BASE =
  "enterprise-product-analytics-baseline-v1" as const;

export const PRODUCT_ADMIN_FREEZE_VERSION =
  "product-admin-foundation-freeze-1" as const;

export const ADMIN_TENANT_KINDS = [
  "PLATFORM",
  "ORGANIZATION",
  "PARTNER",
] as const;

export const ADMIN_TENANT_STATUSES = [
  "PROVISIONING",
  "ACTIVE",
  "SUSPENDED",
] as const;

export const ADMIN_SETTING_SCOPES = [
  "GLOBAL",
  "TENANT",
  "OPERATOR",
] as const;

export const ADMIN_OPERATOR_ROLES = [
  "OWNER",
  "ADMIN",
  "SUPPORT",
] as const;

export const ADMIN_OPERATOR_STATUSES = [
  "ACTIVE",
  "DISABLED",
] as const;

export const ADMIN_POLICY_EFFECTS = [
  "ALLOW",
  "DENY",
  "AUDIT",
] as const;

export const ADMIN_POLICY_STATUSES = [
  "DRAFT",
  "ENFORCED",
] as const;

export const ADMIN_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const ADMIN_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
