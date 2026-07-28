/**
 * Product M14 — Intelligence Catalog constants
 * MODULE: Enterprise Intelligence Catalog (M14-P2)
 * BASE: enterprise-product-intelligence-foundation-v1
 * Isolated namespace: lib/product/m14/catalog-runtime
 * (bare catalog/ forbidden by M14-P1 verify)
 * Definition only — no DB / vector / RAG / embedding / intelligence execution
 */

export const PRODUCT_INTELLIGENCE_CATALOG_ID =
  "enterprise-product-intelligence-catalog-v1" as const;

export const PRODUCT_INTELLIGENCE_CATALOG_VERSION =
  "product-intelligence-catalog-1" as const;

export const PRODUCT_INTELLIGENCE_CATALOG_FREEZE_VERSION =
  "product-intelligence-catalog-freeze-1" as const;

export const PRODUCT_INTELLIGENCE_CATALOG_BASE =
  "enterprise-product-intelligence-foundation-v1" as const;

export const PRODUCT_INTELLIGENCE_CATALOG_FREEZE_TAG =
  "product-intelligence-catalog-freeze-1" as const;

export const INTELLIGENCE_CATALOG_KINDS = [
  "LENS",
  "PORTFOLIO",
  "DOMAIN",
  "INTERNAL",
] as const;

export const INTELLIGENCE_CATALOG_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const INTELLIGENCE_CATALOG_ENTRY_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const INTELLIGENCE_CATALOG_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const INTELLIGENCE_CATALOG_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
