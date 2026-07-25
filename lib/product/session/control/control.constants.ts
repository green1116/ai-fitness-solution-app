/**
 * Product Session — Session Control constants
 * MODULE: Session
 * BASE: enterprise-product-authorization-rbac-v1
 * Isolated namespace: lib/product/session
 */

export const PRODUCT_SESSION_CONTROL_ID =
  "enterprise-product-session-control-v1" as const;

export const PRODUCT_SESSION_CONTROL_VERSION =
  "product-session-1" as const;

export const PRODUCT_SESSION_CONTROL_FREEZE_VERSION =
  "product-session-control-freeze-1" as const;

export const PRODUCT_SESSION_CONTROL_BASE =
  "enterprise-product-authorization-rbac-v1" as const;

export const PRODUCT_SESSION_FREEZE_VERSION =
  "product-session-control-freeze-1" as const;

export const SESSION_LIFECYCLE_STATUSES = [
  "ACTIVE",
  "REFRESHING",
  "EXPIRED",
  "REVOKED",
] as const;

export const TOKEN_FLOW_KINDS = [
  "ACCESS",
  "REFRESH",
  "ID",
] as const;

export const TOKEN_FLOW_STATUSES = [
  "ACTIVE",
  "ROTATED",
  "REVOKED",
  "EXPIRED",
] as const;

export const VALIDATION_RESULTS = [
  "VALID",
  "INVALID",
  "EXPIRED",
] as const;

export const SESSION_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const SESSION_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
