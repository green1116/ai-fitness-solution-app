/**
 * Product API SDK — constants
 * MODULE: SDK (M07-P4)
 * BASE: enterprise-product-api-gateway-v1
 * Isolated namespace: lib/product/api-sdk
 */

export const PRODUCT_API_SDK_ID =
  "enterprise-product-api-sdk-v1" as const;

export const PRODUCT_API_SDK_VERSION =
  "product-api-sdk-1" as const;

export const PRODUCT_API_SDK_FREEZE_VERSION =
  "product-api-sdk-freeze-1" as const;

export const PRODUCT_API_SDK_BASE =
  "enterprise-product-api-gateway-v1" as const;

export const PRODUCT_API_SDK_FREEZE_TAG =
  "product-api-sdk-freeze-1" as const;

export const SDK_CLIENT_KINDS = ["TYPED", "REST", "INTERNAL"] as const;

export const SDK_CLIENT_STATUSES = ["ACTIVE", "DEPRECATED", "RETIRED"] as const;

export const SDK_OPERATION_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
] as const;

export const SDK_SCHEMA_KINDS = ["REQUEST", "RESPONSE"] as const;

export const SDK_PACKAGE_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "RETIRED",
] as const;

export const SDK_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const SDK_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
