/**
 * Product Authorization — RBAC constants
 * MODULE: Authorization
 * BASE: enterprise-product-identity-foundation-v1
 * Isolated namespace: lib/product/authorization
 */

export const PRODUCT_AUTHORIZATION_RBAC_ID =
  "enterprise-product-authorization-rbac-v1" as const;

export const PRODUCT_AUTHORIZATION_RBAC_VERSION =
  "product-authorization-1" as const;

export const PRODUCT_AUTHORIZATION_RBAC_FREEZE_VERSION =
  "product-authorization-rbac-freeze-1" as const;

export const PRODUCT_AUTHORIZATION_RBAC_BASE =
  "enterprise-product-identity-foundation-v1" as const;

export const PRODUCT_AUTHORIZATION_FREEZE_VERSION =
  "product-authorization-rbac-freeze-1" as const;

export const ROLE_KINDS = [
  "ADMIN",
  "OPERATOR",
  "VIEWER",
  "SERVICE",
] as const;

export const PERMISSION_EFFECTS = [
  "ALLOW",
  "DENY",
] as const;

export const ASSIGNMENT_STATUSES = [
  "ACTIVE",
  "SUSPENDED",
  "REVOKED",
] as const;

export const DECISION_RESULTS = [
  "ALLOW",
  "DENY",
] as const;

export const AUTHORIZATION_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const AUTHORIZATION_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
