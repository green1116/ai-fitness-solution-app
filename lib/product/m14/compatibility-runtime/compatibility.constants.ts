/**
 * Product M14 — Intelligence Compatibility Runtime constants
 * MODULE: Enterprise Intelligence Compatibility (M14-P5)
 * BASE: enterprise-product-intelligence-policy-v1
 * Isolated namespace: lib/product/m14/compatibility-runtime
 * (bare compatibility/ forbidden by M14-P4 verify)
 * Definition only — no DB / vector / RAG / embedding / intelligence execution
 */

export const PRODUCT_INTELLIGENCE_COMPATIBILITY_ID =
  "enterprise-product-intelligence-compatibility-v1" as const;

export const PRODUCT_INTELLIGENCE_COMPATIBILITY_VERSION =
  "product-intelligence-compatibility-1" as const;

export const PRODUCT_INTELLIGENCE_COMPATIBILITY_FREEZE_VERSION =
  "product-intelligence-compatibility-freeze-1" as const;

export const PRODUCT_INTELLIGENCE_COMPATIBILITY_BASE =
  "enterprise-product-intelligence-policy-v1" as const;

export const PRODUCT_INTELLIGENCE_COMPATIBILITY_FREEZE_TAG =
  "product-intelligence-compatibility-freeze-1" as const;

export const INTELLIGENCE_COMPATIBILITY_MATRIX_KINDS = [
  "VERSION",
  "POLICY",
  "LAYER",
  "INTERNAL",
] as const;

export const INTELLIGENCE_COMPATIBILITY_MATRIX_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const INTELLIGENCE_COMPATIBILITY_PAIR_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const INTELLIGENCE_COMPATIBILITY_RELATIONS = [
  "COMPATIBLE",
  "INCOMPATIBLE",
  "DEPRECATED",
  "SUPPORTED",
] as const;

export const INTELLIGENCE_COMPATIBILITY_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const INTELLIGENCE_COMPATIBILITY_CONSTRAINTS = [
  "VERSION_RANGE",
  "POLICY_GATE",
  "FALLBACK",
  "INTERNAL",
] as const;

export const INTELLIGENCE_COMPATIBILITY_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
