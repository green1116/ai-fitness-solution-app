/**
 * Product M11 — Knowledge Catalog constants
 * MODULE: Knowledge Catalog (M11-P2)
 * BASE: enterprise-product-knowledge-foundation-v1
 * Isolated namespace: lib/product/m11/catalog
 * Definition only — no DB / vector / RAG / embedding / external deps
 */

export const PRODUCT_KNOWLEDGE_CATALOG_ID =
  "enterprise-product-knowledge-catalog-v1" as const;

export const PRODUCT_KNOWLEDGE_CATALOG_VERSION =
  "product-knowledge-catalog-1" as const;

export const PRODUCT_KNOWLEDGE_CATALOG_FREEZE_VERSION =
  "product-knowledge-catalog-freeze-1" as const;

export const PRODUCT_KNOWLEDGE_CATALOG_BASE =
  "enterprise-product-knowledge-foundation-v1" as const;

export const PRODUCT_KNOWLEDGE_CATALOG_FREEZE_TAG =
  "product-knowledge-catalog-freeze-1" as const;

export const KNOWLEDGE_CATALOG_KINDS = [
  "DOMAIN",
  "TOPIC",
  "LIBRARY",
  "INTERNAL",
] as const;

export const KNOWLEDGE_CATALOG_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const KNOWLEDGE_CATALOG_ENTRY_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const KNOWLEDGE_CATALOG_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const KNOWLEDGE_CATALOG_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
