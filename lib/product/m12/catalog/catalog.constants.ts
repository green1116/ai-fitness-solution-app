/**
 * Product M12 — Agent Catalog constants
 * MODULE: Agent Catalog (M12-P2)
 * BASE: enterprise-product-agent-foundation-v1
 * Isolated namespace: lib/product/m12/catalog
 * Definition only — no DB / vector / RAG / embedding / agent execution
 */

export const PRODUCT_AGENT_CATALOG_ID =
  "enterprise-product-agent-catalog-v1" as const;

export const PRODUCT_AGENT_CATALOG_VERSION =
  "product-agent-catalog-1" as const;

export const PRODUCT_AGENT_CATALOG_FREEZE_VERSION =
  "product-agent-catalog-freeze-1" as const;

export const PRODUCT_AGENT_CATALOG_BASE =
  "enterprise-product-agent-foundation-v1" as const;

export const PRODUCT_AGENT_CATALOG_FREEZE_TAG =
  "product-agent-catalog-freeze-1" as const;

export const AGENT_CATALOG_KINDS = [
  "ROLE",
  "FLEET",
  "DOMAIN",
  "INTERNAL",
] as const;

export const AGENT_CATALOG_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AGENT_CATALOG_ENTRY_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AGENT_CATALOG_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const AGENT_CATALOG_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
