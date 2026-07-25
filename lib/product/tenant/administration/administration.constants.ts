/**
 * Product Tenant — Administration constants
 * MODULE: Tenant Administration
 * BASE: enterprise-product-admin-foundation-v1
 * Isolated namespace: lib/product/tenant
 */

export const PRODUCT_TENANT_ADMINISTRATION_ID =
  "enterprise-product-tenant-administration-v1" as const;

export const PRODUCT_TENANT_ADMINISTRATION_VERSION =
  "product-tenant-1" as const;

export const PRODUCT_TENANT_ADMINISTRATION_FREEZE_VERSION =
  "product-tenant-administration-freeze-1" as const;

export const PRODUCT_TENANT_ADMINISTRATION_BASE =
  "enterprise-product-admin-foundation-v1" as const;

export const PRODUCT_TENANT_FREEZE_VERSION =
  "product-tenant-administration-freeze-1" as const;

export const TENANT_TIERS = [
  "STARTER",
  "GROWTH",
  "ENTERPRISE",
] as const;

export const TENANT_RECORD_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "RETIRED",
] as const;

export const TENANT_QUOTA_RESOURCES = [
  "USERS",
  "STORAGE",
  "API",
] as const;

export const TENANT_ISOLATION_MODES = [
  "SHARED",
  "DEDICATED",
  "HYBRID",
] as const;

export const TENANT_LIFECYCLE_STATES = [
  "PROVISIONED",
  "OPERATIONAL",
  "SUSPENDED",
  "ARCHIVED",
] as const;

export const TENANT_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const TENANT_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
