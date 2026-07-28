/**
 * Product M11 — Knowledge Policy Runtime constants
 * MODULE: Knowledge Policy (M11-P4)
 * BASE: enterprise-product-knowledge-dependency-v1
 * Isolated namespace: lib/product/m11/policy-runtime
 * Definition only — no DB / vector / RAG / embedding / external deps
 */

export const PRODUCT_KNOWLEDGE_POLICY_ID =
  "enterprise-product-knowledge-policy-v1" as const;

export const PRODUCT_KNOWLEDGE_POLICY_VERSION =
  "product-knowledge-policy-1" as const;

export const PRODUCT_KNOWLEDGE_POLICY_FREEZE_VERSION =
  "product-knowledge-policy-freeze-1" as const;

export const PRODUCT_KNOWLEDGE_POLICY_BASE =
  "enterprise-product-knowledge-dependency-v1" as const;

export const PRODUCT_KNOWLEDGE_POLICY_FREEZE_TAG =
  "product-knowledge-policy-freeze-1" as const;

export const KNOWLEDGE_POLICY_KINDS = [
  "ACCESS",
  "LIFECYCLE",
  "QUALITY",
  "INTERNAL",
] as const;

export const KNOWLEDGE_POLICY_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const KNOWLEDGE_POLICY_RULE_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const KNOWLEDGE_POLICY_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const KNOWLEDGE_POLICY_ENFORCEMENTS = [
  "DECLARATIVE",
  "GATE",
  "AUDIT_ONLY",
] as const;

export const KNOWLEDGE_POLICY_CONSTRAINTS = [
  "DEPENDENCY_ACYCLIC",
  "CATALOG_COMPLETE",
  "ACCESS_CONTROL",
  "INTERNAL",
] as const;

export const KNOWLEDGE_POLICY_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
