/**
 * Product M11 — Knowledge Dependency Runtime constants
 * MODULE: Knowledge Dependency (M11-P3)
 * BASE: enterprise-product-knowledge-catalog-v1
 * Isolated namespace: lib/product/m11/dependency-runtime
 * Definition only — no DB / vector / RAG / embedding / external deps
 */

export const PRODUCT_KNOWLEDGE_DEPENDENCY_ID =
  "enterprise-product-knowledge-dependency-v1" as const;

export const PRODUCT_KNOWLEDGE_DEPENDENCY_VERSION =
  "product-knowledge-dependency-1" as const;

export const PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION =
  "product-knowledge-dependency-freeze-1" as const;

export const PRODUCT_KNOWLEDGE_DEPENDENCY_BASE =
  "enterprise-product-knowledge-catalog-v1" as const;

export const PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_TAG =
  "product-knowledge-dependency-freeze-1" as const;

export const KNOWLEDGE_DEPENDENCY_GRAPH_KINDS = [
  "DOMAIN",
  "CATALOG",
  "TOPIC",
  "INTERNAL",
] as const;

export const KNOWLEDGE_DEPENDENCY_GRAPH_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const KNOWLEDGE_DEPENDENCY_NODE_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const KNOWLEDGE_DEPENDENCY_EDGE_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const KNOWLEDGE_DEPENDENCY_IMPACTS = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export const KNOWLEDGE_DEPENDENCY_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
