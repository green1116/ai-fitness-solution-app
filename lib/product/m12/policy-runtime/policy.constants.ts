/**
 * Product M12 — Agent Policy Runtime constants
 * MODULE: Agent Policy (M12-P4)
 * BASE: enterprise-product-agent-dependency-v1
 * Isolated namespace: lib/product/m12/policy-runtime
 * Definition only — no DB / vector / RAG / embedding / agent execution
 */

export const PRODUCT_AGENT_POLICY_ID =
  "enterprise-product-agent-policy-v1" as const;

export const PRODUCT_AGENT_POLICY_VERSION =
  "product-agent-policy-1" as const;

export const PRODUCT_AGENT_POLICY_FREEZE_VERSION =
  "product-agent-policy-freeze-1" as const;

export const PRODUCT_AGENT_POLICY_BASE =
  "enterprise-product-agent-dependency-v1" as const;

export const PRODUCT_AGENT_POLICY_FREEZE_TAG =
  "product-agent-policy-freeze-1" as const;

export const AGENT_POLICY_KINDS = [
  "ACCESS",
  "LIFECYCLE",
  "SAFETY",
  "INTERNAL",
] as const;

export const AGENT_POLICY_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AGENT_POLICY_RULE_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AGENT_POLICY_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const AGENT_POLICY_ENFORCEMENTS = [
  "DECLARATIVE",
  "GATE",
  "AUDIT_ONLY",
] as const;

export const AGENT_POLICY_CONSTRAINTS = [
  "DEPENDENCY_ACYCLIC",
  "CATALOG_COMPLETE",
  "ACCESS_CONTROL",
  "INTERNAL",
] as const;

export const AGENT_POLICY_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
