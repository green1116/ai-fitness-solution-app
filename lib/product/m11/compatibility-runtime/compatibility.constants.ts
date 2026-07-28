/**
 * Product M11 — Knowledge Compatibility Runtime constants
 * MODULE: Knowledge Compatibility (M11-P5)
 * BASE: enterprise-product-knowledge-policy-v1
 * Isolated namespace: lib/product/m11/compatibility-runtime
 * Definition only — no DB / vector / RAG / embedding / external deps
 */

export const PRODUCT_KNOWLEDGE_COMPATIBILITY_ID =
  "enterprise-product-knowledge-compatibility-v1" as const;

export const PRODUCT_KNOWLEDGE_COMPATIBILITY_VERSION =
  "product-knowledge-compatibility-1" as const;

export const PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION =
  "product-knowledge-compatibility-freeze-1" as const;

export const PRODUCT_KNOWLEDGE_COMPATIBILITY_BASE =
  "enterprise-product-knowledge-policy-v1" as const;

export const PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_TAG =
  "product-knowledge-compatibility-freeze-1" as const;

export const KNOWLEDGE_COMPATIBILITY_MATRIX_KINDS = [
  "VERSION",
  "POLICY",
  "LAYER",
  "INTERNAL",
] as const;

export const KNOWLEDGE_COMPATIBILITY_MATRIX_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const KNOWLEDGE_COMPATIBILITY_PAIR_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const KNOWLEDGE_COMPATIBILITY_RELATIONS = [
  "COMPATIBLE",
  "INCOMPATIBLE",
  "DEPRECATED",
  "SUPPORTED",
] as const;

export const KNOWLEDGE_COMPATIBILITY_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const KNOWLEDGE_COMPATIBILITY_CONSTRAINTS = [
  "VERSION_RANGE",
  "POLICY_GATE",
  "FALLBACK",
  "INTERNAL",
] as const;

export const KNOWLEDGE_COMPATIBILITY_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
