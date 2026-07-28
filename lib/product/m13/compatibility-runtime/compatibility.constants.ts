/**
 * Product M13 — OS Compatibility Runtime constants
 * MODULE: OS Compatibility (M13-P5)
 * BASE: enterprise-product-os-policy-v1
 * Isolated namespace: lib/product/m13/compatibility-runtime
 * (bare compatibility/ forbidden by M13-P4 verify)
 * Definition only — no DB / vector / RAG / embedding / OS execution
 */

export const PRODUCT_OS_COMPATIBILITY_ID =
  "enterprise-product-os-compatibility-v1" as const;

export const PRODUCT_OS_COMPATIBILITY_VERSION =
  "product-os-compatibility-1" as const;

export const PRODUCT_OS_COMPATIBILITY_FREEZE_VERSION =
  "product-os-compatibility-freeze-1" as const;

export const PRODUCT_OS_COMPATIBILITY_BASE =
  "enterprise-product-os-policy-v1" as const;

export const PRODUCT_OS_COMPATIBILITY_FREEZE_TAG =
  "product-os-compatibility-freeze-1" as const;

export const OS_COMPATIBILITY_MATRIX_KINDS = [
  "VERSION",
  "POLICY",
  "LAYER",
  "INTERNAL",
] as const;

export const OS_COMPATIBILITY_MATRIX_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const OS_COMPATIBILITY_PAIR_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const OS_COMPATIBILITY_RELATIONS = [
  "COMPATIBLE",
  "INCOMPATIBLE",
  "DEPRECATED",
  "SUPPORTED",
] as const;

export const OS_COMPATIBILITY_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const OS_COMPATIBILITY_CONSTRAINTS = [
  "VERSION_RANGE",
  "POLICY_GATE",
  "FALLBACK",
  "INTERNAL",
] as const;

export const OS_COMPATIBILITY_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
