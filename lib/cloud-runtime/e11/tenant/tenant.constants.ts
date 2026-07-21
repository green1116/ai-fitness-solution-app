/**
 * E11-P3 — Cloud Runtime Multi-Tenant Isolation constants
 * BASE: enterprise-e11-p2-cloud-runtime-execution-v1
 */

export const E11_TENANT_ID =
  "enterprise-e11-cloud-runtime-tenant-v1" as const;

export const E11_TENANT_VERSION = "e11-tenant-1" as const;
export const E11_TENANT_FREEZE_VERSION = "e11-tenant-freeze-1" as const;

export const E11_TENANT_BASE =
  "enterprise-e11-p2-cloud-runtime-execution-v1" as const;

export const E11_P3_TENANT_FREEZE_VERSION =
  "e11-p3-cloud-runtime-tenant-freeze-1" as const;

export const TENANT_STATUSES = [
  "ACTIVE",
  "SUSPENDED",
  "ARCHIVED",
] as const;

export const ORGANIZATION_STATUSES = [
  "ACTIVE",
  "SUSPENDED",
  "CLOSED",
] as const;

export const TENANT_QUOTA_TYPES = [
  "RUNTIME",
  "CONTEXT",
  "TASK",
  "STORAGE",
] as const;

export const ISOLATION_POLICY_MODES = [
  "STRICT",
  "SHARED_READONLY",
  "PERMISSIVE",
] as const;

export const TENANT_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;

export const ROUTE_DECISIONS = [
  "ALLOW",
  "DENY",
  "QUOTA_EXCEEDED",
] as const;
