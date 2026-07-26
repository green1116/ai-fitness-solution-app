/**
 * Product API Authentication — constants
 * MODULE: API Authentication (M07-P2)
 * BASE: enterprise-product-api-foundation-v1
 * Isolated namespace: lib/product/api-authentication
 */

export const PRODUCT_API_AUTHENTICATION_ID =
  "enterprise-product-api-authentication-v1" as const;

export const PRODUCT_API_AUTHENTICATION_VERSION =
  "product-api-authentication-1" as const;

export const PRODUCT_API_AUTHENTICATION_FREEZE_VERSION =
  "product-api-authentication-freeze-1" as const;

export const PRODUCT_API_AUTHENTICATION_BASE =
  "enterprise-product-api-foundation-v1" as const;

export const PRODUCT_API_AUTHENTICATION_FREEZE_TAG =
  "product-api-authentication-freeze-1" as const;

export const API_CREDENTIAL_KINDS = [
  "API_KEY",
  "BEARER",
  "BASIC",
] as const;

export const API_CREDENTIAL_STATUSES = [
  "ACTIVE",
  "REVOKED",
  "EXPIRED",
] as const;

export const API_TOKEN_VALIDATION_VERDICTS = [
  "VALID",
  "INVALID",
  "EXPIRED",
] as const;

export const API_AUTH_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const API_AUTH_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
