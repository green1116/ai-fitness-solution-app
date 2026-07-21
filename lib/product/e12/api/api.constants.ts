/**
 * E12-P5 — API Productization Layer constants
 * BASE: enterprise-e12-p4-billing-commercial-v1
 */

export const E12_API_PRODUCT_ID =
  "enterprise-e12-api-productization-v1" as const;

export const E12_API_PRODUCT_VERSION = "e12-api-1" as const;
export const E12_API_PRODUCT_FREEZE_VERSION =
  "e12-api-productization-freeze-1" as const;

export const E12_API_PRODUCT_BASE =
  "enterprise-e12-p4-billing-commercial-v1" as const;

export const E12_P5_API_PRODUCT_FREEZE_VERSION =
  "e12-p5-api-productization-freeze-1" as const;

export const API_CATALOG_STATUSES = [
  "ACTIVE",
  "DEPRECATED",
  "ARCHIVED",
] as const;

export const API_VERSIONS = ["v1", "v2"] as const;

export const API_KEY_STATUSES = [
  "ACTIVE",
  "REVOKED",
  "EXPIRED",
] as const;

export const DEVELOPER_ACCESS_STATUSES = [
  "ACTIVE",
  "SUSPENDED",
  "REVOKED",
] as const;

export const API_PERMISSION_SCOPES = [
  "api:read",
  "api:write",
  "api:admin",
  "api:usage:read",
  "api:key:manage",
  "api:catalog:read",
] as const;

export const API_USAGE_ACTIONS = [
  "API_CALL",
  "API_KEY_CREATED",
  "API_KEY_REVOKED",
  "DEVELOPER_REGISTERED",
  "DEVELOPER_SUSPENDED",
  "SCOPE_GRANTED",
  "SCOPE_REVOKED",
] as const;

export const API_AUDIT_ACTIONS = [
  "API_CALL",
  "KEY_CREATED",
  "KEY_REVOKED",
  "DEVELOPER_REGISTERED",
  "DEVELOPER_SUSPENDED",
  "SCOPE_CHANGED",
  "RATE_LIMIT_HIT",
] as const;

export const API_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
