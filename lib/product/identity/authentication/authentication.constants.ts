/**
 * Product Identity — Identity Foundation constants
 * MODULE: Authentication
 * BASE: enterprise-product-iteration-foundation-v1
 * Isolated namespace: lib/product/identity
 */

export const PRODUCT_IDENTITY_FOUNDATION_ID =
  "enterprise-product-identity-foundation-v1" as const;

export const PRODUCT_IDENTITY_FOUNDATION_VERSION =
  "product-identity-1" as const;

export const PRODUCT_IDENTITY_FOUNDATION_FREEZE_VERSION =
  "product-identity-foundation-freeze-1" as const;

export const PRODUCT_IDENTITY_FOUNDATION_BASE =
  "enterprise-product-iteration-foundation-v1" as const;

export const PRODUCT_IDENTITY_FREEZE_VERSION =
  "product-identity-foundation-freeze-1" as const;

export const AUTH_STATUSES = [
  "ANONYMOUS",
  "AUTHENTICATED",
  "CHALLENGED",
  "LOCKED",
  "REVOKED",
] as const;

export const PRINCIPAL_KINDS = [
  "USER",
  "SERVICE",
  "TENANT_ADMIN",
  "SYSTEM",
] as const;

export const CREDENTIAL_KINDS = [
  "PASSWORD",
  "API_KEY",
  "SSO",
  "MFA",
] as const;

export const SESSION_STATUSES = [
  "ACTIVE",
  "EXPIRED",
  "REVOKED",
] as const;

export const TOKEN_KINDS = [
  "ACCESS",
  "REFRESH",
  "ID",
] as const;

export const ACCESS_DECISIONS = [
  "ALLOW",
  "DENY",
  "CHALLENGE",
] as const;

export const IDENTITY_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const IDENTITY_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
