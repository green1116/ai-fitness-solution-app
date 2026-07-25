/**
 * Product Organization — Management constants
 * MODULE: Organization
 * BASE: enterprise-product-customer-foundation-v1
 * Isolated namespace: lib/product/organization
 */

export const PRODUCT_ORGANIZATION_MANAGEMENT_ID =
  "enterprise-product-organization-management-v1" as const;

export const PRODUCT_ORGANIZATION_MANAGEMENT_VERSION =
  "product-organization-1" as const;

export const PRODUCT_ORGANIZATION_MANAGEMENT_FREEZE_VERSION =
  "product-organization-management-freeze-1" as const;

export const PRODUCT_ORGANIZATION_MANAGEMENT_BASE =
  "enterprise-product-customer-foundation-v1" as const;

export const PRODUCT_ORGANIZATION_FREEZE_VERSION =
  "product-organization-management-freeze-1" as const;

export const ORG_KINDS = ["ROOT", "DIVISION", "TEAM"] as const;

export const ORG_STATUSES = ["ACTIVE", "INACTIVE", "ARCHIVED"] as const;

export const MEMBERSHIP_STATUSES = [
  "INVITED",
  "ACTIVE",
  "REMOVED",
] as const;

export const ORG_ROLES = ["OWNER", "ADMIN", "MEMBER"] as const;

export const HIERARCHY_KINDS = ["PARENT_CHILD", "AFFILIATE"] as const;

export const ORGANIZATION_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const ORGANIZATION_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
