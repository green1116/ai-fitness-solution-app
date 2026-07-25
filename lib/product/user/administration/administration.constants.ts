/**
 * Product User — Administration constants
 * MODULE: User Administration
 * BASE: enterprise-product-tenant-administration-v1
 * Isolated namespace: lib/product/user
 */

export const PRODUCT_USER_ADMINISTRATION_ID =
  "enterprise-product-user-administration-v1" as const;

export const PRODUCT_USER_ADMINISTRATION_VERSION =
  "product-user-1" as const;

export const PRODUCT_USER_ADMINISTRATION_FREEZE_VERSION =
  "product-user-administration-freeze-1" as const;

export const PRODUCT_USER_ADMINISTRATION_BASE =
  "enterprise-product-tenant-administration-v1" as const;

export const PRODUCT_USER_FREEZE_VERSION =
  "product-user-administration-freeze-1" as const;

export const USER_ACCOUNT_KINDS = [
  "HUMAN",
  "SERVICE",
  "SYSTEM",
] as const;

export const USER_ACCOUNT_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "RETIRED",
] as const;

export const USER_MEMBERSHIP_ROLES = [
  "OWNER",
  "ADMIN",
  "MEMBER",
] as const;

export const USER_MEMBERSHIP_STATUSES = [
  "INVITED",
  "ACTIVE",
  "REMOVED",
] as const;

export const USER_PRIVILEGE_SCOPES = [
  "TENANT",
  "WORKSPACE",
  "GLOBAL",
] as const;

export const USER_LIFECYCLE_STATES = [
  "INVITED",
  "ACTIVE",
  "SUSPENDED",
  "DEACTIVATED",
] as const;

export const USER_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const USER_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
