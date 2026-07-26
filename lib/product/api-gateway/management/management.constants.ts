/**
 * Product API Gateway — constants
 * MODULE: Gateway (M07-P3)
 * BASE: enterprise-product-api-authentication-v1
 * Isolated namespace: lib/product/api-gateway
 */

export const PRODUCT_API_GATEWAY_ID =
  "enterprise-product-api-gateway-v1" as const;

export const PRODUCT_API_GATEWAY_VERSION =
  "product-api-gateway-1" as const;

export const PRODUCT_API_GATEWAY_FREEZE_VERSION =
  "product-api-gateway-freeze-1" as const;

export const PRODUCT_API_GATEWAY_BASE =
  "enterprise-product-api-authentication-v1" as const;

export const PRODUCT_API_GATEWAY_FREEZE_TAG =
  "product-api-gateway-freeze-1" as const;

export const GATEWAY_STATUSES = ["ACTIVE", "DISABLED"] as const;

export const GATEWAY_HTTP_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
] as const;

export const GATEWAY_POLICY_MODES = [
  "OPEN",
  "AUTH_REQUIRED",
  "INTERNAL",
] as const;

export const GATEWAY_VALIDATION_VERDICTS = [
  "ACCEPTED",
  "REJECTED",
  "UNRESOLVED",
] as const;

export const GATEWAY_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const GATEWAY_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
