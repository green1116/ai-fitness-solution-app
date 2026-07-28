/**
 * Product M14 — Intelligence Policy Runtime constants
 * MODULE: Enterprise Intelligence Policy (M14-P4)
 * BASE: enterprise-product-intelligence-dependency-v1
 * Isolated namespace: lib/product/m14/policy-runtime
 * Definition only — no DB / vector / RAG / embedding / intelligence execution
 */

export const PRODUCT_INTELLIGENCE_POLICY_ID =
  "enterprise-product-intelligence-policy-v1" as const;

export const PRODUCT_INTELLIGENCE_POLICY_VERSION =
  "product-intelligence-policy-1" as const;

export const PRODUCT_INTELLIGENCE_POLICY_FREEZE_VERSION =
  "product-intelligence-policy-freeze-1" as const;

export const PRODUCT_INTELLIGENCE_POLICY_BASE =
  "enterprise-product-intelligence-dependency-v1" as const;

export const PRODUCT_INTELLIGENCE_POLICY_FREEZE_TAG =
  "product-intelligence-policy-freeze-1" as const;

export const INTELLIGENCE_POLICY_KINDS = [
  "ACCESS",
  "LIFECYCLE",
  "SAFETY",
  "INTERNAL",
] as const;

export const INTELLIGENCE_POLICY_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const INTELLIGENCE_POLICY_RULE_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const INTELLIGENCE_POLICY_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const INTELLIGENCE_POLICY_ENFORCEMENTS = [
  "DECLARATIVE",
  "GATE",
  "AUDIT_ONLY",
] as const;

export const INTELLIGENCE_POLICY_CONSTRAINTS = [
  "DEPENDENCY_ACYCLIC",
  "CATALOG_COMPLETE",
  "ACCESS_CONTROL",
  "INTERNAL",
] as const;

export const INTELLIGENCE_POLICY_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
