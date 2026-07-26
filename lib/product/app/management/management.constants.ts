/**
 * Product App — Registry constants
 * MODULE: App Registry (M08-P4)
 * BASE: enterprise-product-partner-management-v1
 * Isolated namespace: lib/product/app
 */

export const PRODUCT_APP_REGISTRY_ID =
  "enterprise-product-app-registry-v1" as const;

export const PRODUCT_APP_REGISTRY_VERSION = "product-app-1" as const;

export const PRODUCT_APP_REGISTRY_FREEZE_VERSION =
  "product-app-registry-freeze-1" as const;

export const PRODUCT_APP_REGISTRY_BASE =
  "enterprise-product-partner-management-v1" as const;

export const PRODUCT_APP_FREEZE_TAG =
  "product-app-registry-freeze-1" as const;

export const APP_KINDS = [
  "INTERNAL",
  "PARTNER",
  "INTEGRATION",
  "EXTENSION",
] as const;

export const APP_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "SUSPENDED",
  "RETIRED",
] as const;

export const APP_VERSION_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const APP_OWNERSHIP_STATUSES = [
  "ASSIGNED",
  "TRANSFERRED",
  "REVOKED",
] as const;

export const APP_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const APP_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
