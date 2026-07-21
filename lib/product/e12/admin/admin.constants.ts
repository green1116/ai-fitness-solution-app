/**
 * E12-P3 — Enterprise Admin Console Layer constants
 * BASE: enterprise-e12-p2-saas-tenant-product-v1
 */

export const E12_ADMIN_CONSOLE_ID =
  "enterprise-e12-enterprise-admin-console-v1" as const;

export const E12_ADMIN_CONSOLE_VERSION = "e12-admin-1" as const;
export const E12_ADMIN_CONSOLE_FREEZE_VERSION =
  "e12-admin-console-freeze-1" as const;

export const E12_ADMIN_CONSOLE_BASE =
  "enterprise-e12-p2-saas-tenant-product-v1" as const;

export const E12_P3_ADMIN_CONSOLE_FREEZE_VERSION =
  "e12-p3-enterprise-admin-console-freeze-1" as const;

export const ORGANIZATION_STATUSES = [
  "ACTIVE",
  "SUSPENDED",
  "ARCHIVED",
] as const;

export const ADMIN_USER_STATUSES = [
  "ACTIVE",
  "INVITED",
  "SUSPENDED",
  "DEACTIVATED",
] as const;

export const ADMIN_ROLE_KINDS = [
  "SUPER_ADMIN",
  "ORG_ADMIN",
  "TENANT_ADMIN",
  "AUDITOR",
] as const;

export const ADMIN_PERMISSIONS = [
  "organization:read",
  "organization:write",
  "tenant:read",
  "tenant:write",
  "tenant:suspend",
  "product:config:read",
  "product:config:write",
  "entitlement:read",
  "capability:evaluate",
  "audit:read",
] as const;

export const PERMISSION_DECISIONS = ["ALLOW", "DENY"] as const;

export const PRODUCT_CONFIG_SCOPES = [
  "ORGANIZATION",
  "TENANT",
  "PRODUCT",
] as const;

export const ADMIN_AUDIT_ACTIONS = [
  "ORG_CREATED",
  "ORG_ADMIN_ASSIGNED",
  "ROLE_ASSIGNED",
  "TENANT_LINKED",
  "TENANT_SUSPENDED",
  "TENANT_ACTIVATED",
  "PRODUCT_CONFIG_SET",
  "PERMISSION_EVALUATED",
  "CAPABILITY_EVALUATED",
] as const;

export const ADMIN_CONSOLE_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
