/**
 * Product M12 — Agent Dependency Runtime constants
 * MODULE: Agent Dependency (M12-P3)
 * BASE: enterprise-product-agent-catalog-v1
 * Isolated namespace: lib/product/m12/dependency-runtime
 * Definition only — no DB / vector / RAG / embedding / agent execution
 */

export const PRODUCT_AGENT_DEPENDENCY_ID =
  "enterprise-product-agent-dependency-v1" as const;

export const PRODUCT_AGENT_DEPENDENCY_VERSION =
  "product-agent-dependency-1" as const;

export const PRODUCT_AGENT_DEPENDENCY_FREEZE_VERSION =
  "product-agent-dependency-freeze-1" as const;

export const PRODUCT_AGENT_DEPENDENCY_BASE =
  "enterprise-product-agent-catalog-v1" as const;

export const PRODUCT_AGENT_DEPENDENCY_FREEZE_TAG =
  "product-agent-dependency-freeze-1" as const;

export const AGENT_DEPENDENCY_GRAPH_KINDS = [
  "ROLE",
  "FLEET",
  "DOMAIN",
  "INTERNAL",
] as const;

export const AGENT_DEPENDENCY_GRAPH_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AGENT_DEPENDENCY_NODE_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AGENT_DEPENDENCY_EDGE_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const AGENT_DEPENDENCY_IMPACTS = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export const AGENT_DEPENDENCY_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
