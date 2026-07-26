/**
 * Product API Portal — constants
 * MODULE: Developer Portal (M07-P5)
 * BASE: enterprise-product-api-sdk-v1
 * Isolated namespace: lib/product/api-portal
 */

export const PRODUCT_API_PORTAL_ID =
  "enterprise-product-api-portal-v1" as const;

export const PRODUCT_API_PORTAL_VERSION =
  "product-api-portal-1" as const;

export const PRODUCT_API_PORTAL_FREEZE_VERSION =
  "product-api-portal-freeze-1" as const;

export const PRODUCT_API_PORTAL_BASE =
  "enterprise-product-api-sdk-v1" as const;

export const PRODUCT_API_PORTAL_FREEZE_TAG =
  "product-api-portal-freeze-1" as const;

export const PORTAL_STATUSES = ["ACTIVE", "DISABLED", "RETIRED"] as const;

export const PORTAL_DOC_KINDS = [
  "OVERVIEW",
  "GUIDE",
  "REFERENCE",
  "CHANGELOG",
] as const;

export const PORTAL_CATALOG_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "RETIRED",
] as const;

export const PORTAL_SURFACE_KINDS = [
  "HOME",
  "DOCS",
  "CATALOG",
  "GETTING_STARTED",
] as const;

export const PORTAL_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const PORTAL_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
