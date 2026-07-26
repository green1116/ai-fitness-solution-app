/**
 * Product Marketplace Surface — Management constants
 * MODULE: Marketplace Surface (M08-P5)
 * BASE: enterprise-product-app-registry-v1
 * Isolated namespace: lib/product/marketplace-surface
 */

export const PRODUCT_MARKETPLACE_SURFACE_ID =
  "enterprise-product-marketplace-surface-v1" as const;

export const PRODUCT_MARKETPLACE_SURFACE_VERSION =
  "product-marketplace-surface-1" as const;

export const PRODUCT_MARKETPLACE_SURFACE_FREEZE_VERSION =
  "product-marketplace-surface-freeze-1" as const;

export const PRODUCT_MARKETPLACE_SURFACE_BASE =
  "enterprise-product-app-registry-v1" as const;

export const PRODUCT_MARKETPLACE_SURFACE_FREEZE_TAG =
  "product-marketplace-surface-freeze-1" as const;

export const SURFACE_CATALOG_KINDS = [
  "STOREFRONT",
  "DIRECTORY",
  "FEATURED",
  "INTERNAL",
] as const;

export const SURFACE_CATALOG_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "SUSPENDED",
  "RETIRED",
] as const;

export const SURFACE_LISTING_STATUSES = [
  "DRAFT",
  "VISIBLE",
  "HIDDEN",
  "RETIRED",
] as const;

export const SURFACE_VISIBILITY_MODES = [
  "PUBLIC",
  "PARTNER_ONLY",
  "INTERNAL_ONLY",
] as const;

export const SURFACE_PLACEMENT_KINDS = [
  "HOME",
  "CATEGORY",
  "FEATURED",
  "SEARCH",
] as const;

export const SURFACE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const SURFACE_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
