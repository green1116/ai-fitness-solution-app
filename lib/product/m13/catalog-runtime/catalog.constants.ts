/**
 * Product M13 — OS Catalog constants
 * MODULE: OS Catalog (M13-P2)
 * BASE: enterprise-product-os-foundation-v1
 * Isolated namespace: lib/product/m13/catalog-runtime
 * (bare catalog/ forbidden by M13-P1 verify)
 * Definition only — no DB / vector / RAG / embedding / OS execution
 */

export const PRODUCT_OS_CATALOG_ID =
  "enterprise-product-os-catalog-v1" as const;

export const PRODUCT_OS_CATALOG_VERSION = "product-os-catalog-1" as const;

export const PRODUCT_OS_CATALOG_FREEZE_VERSION =
  "product-os-catalog-freeze-1" as const;

export const PRODUCT_OS_CATALOG_BASE =
  "enterprise-product-os-foundation-v1" as const;

export const PRODUCT_OS_CATALOG_FREEZE_TAG =
  "product-os-catalog-freeze-1" as const;

export const OS_CATALOG_KINDS = [
  "SURFACE",
  "FLEET",
  "DOMAIN",
  "INTERNAL",
] as const;

export const OS_CATALOG_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const OS_CATALOG_ENTRY_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const OS_CATALOG_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const OS_CATALOG_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
