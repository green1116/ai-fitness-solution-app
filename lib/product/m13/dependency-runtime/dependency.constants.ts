/**
 * Product M13 — OS Dependency Runtime constants
 * MODULE: OS Dependency (M13-P3)
 * BASE: enterprise-product-os-catalog-v1
 * Isolated namespace: lib/product/m13/dependency-runtime
 * (bare dependency/ forbidden by M13-P1/P2 verify)
 * Definition only — no DB / vector / RAG / embedding / OS execution
 */

export const PRODUCT_OS_DEPENDENCY_ID =
  "enterprise-product-os-dependency-v1" as const;

export const PRODUCT_OS_DEPENDENCY_VERSION =
  "product-os-dependency-1" as const;

export const PRODUCT_OS_DEPENDENCY_FREEZE_VERSION =
  "product-os-dependency-freeze-1" as const;

export const PRODUCT_OS_DEPENDENCY_BASE =
  "enterprise-product-os-catalog-v1" as const;

export const PRODUCT_OS_DEPENDENCY_FREEZE_TAG =
  "product-os-dependency-freeze-1" as const;

export const OS_DEPENDENCY_GRAPH_KINDS = [
  "SURFACE",
  "FLEET",
  "DOMAIN",
  "INTERNAL",
] as const;

export const OS_DEPENDENCY_GRAPH_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const OS_DEPENDENCY_NODE_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const OS_DEPENDENCY_EDGE_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const OS_DEPENDENCY_IMPACTS = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export const OS_DEPENDENCY_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
