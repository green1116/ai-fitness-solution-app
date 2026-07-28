/**
 * Product M14 — Intelligence Dependency Runtime constants
 * MODULE: Enterprise Intelligence Dependency (M14-P3)
 * BASE: enterprise-product-intelligence-catalog-v1
 * Isolated namespace: lib/product/m14/dependency-runtime
 * (bare dependency/ forbidden by M14-P1/P2 verify)
 * Definition only — no DB / vector / RAG / embedding / intelligence execution
 */

export const PRODUCT_INTELLIGENCE_DEPENDENCY_ID =
  "enterprise-product-intelligence-dependency-v1" as const;

export const PRODUCT_INTELLIGENCE_DEPENDENCY_VERSION =
  "product-intelligence-dependency-1" as const;

export const PRODUCT_INTELLIGENCE_DEPENDENCY_FREEZE_VERSION =
  "product-intelligence-dependency-freeze-1" as const;

export const PRODUCT_INTELLIGENCE_DEPENDENCY_BASE =
  "enterprise-product-intelligence-catalog-v1" as const;

export const PRODUCT_INTELLIGENCE_DEPENDENCY_FREEZE_TAG =
  "product-intelligence-dependency-freeze-1" as const;

export const INTELLIGENCE_DEPENDENCY_GRAPH_KINDS = [
  "LENS",
  "PORTFOLIO",
  "DOMAIN",
  "INTERNAL",
] as const;

export const INTELLIGENCE_DEPENDENCY_GRAPH_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const INTELLIGENCE_DEPENDENCY_NODE_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const INTELLIGENCE_DEPENDENCY_EDGE_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const INTELLIGENCE_DEPENDENCY_IMPACTS = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export const INTELLIGENCE_DEPENDENCY_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
