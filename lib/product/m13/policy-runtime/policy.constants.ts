/**
 * Product M13 — OS Policy Runtime constants
 * MODULE: OS Policy (M13-P4)
 * BASE: enterprise-product-os-dependency-v1
 * Isolated namespace: lib/product/m13/policy-runtime
 * Definition only — no DB / vector / RAG / embedding / OS execution
 */

export const PRODUCT_OS_POLICY_ID = "enterprise-product-os-policy-v1" as const;

export const PRODUCT_OS_POLICY_VERSION = "product-os-policy-1" as const;

export const PRODUCT_OS_POLICY_FREEZE_VERSION =
  "product-os-policy-freeze-1" as const;

export const PRODUCT_OS_POLICY_BASE =
  "enterprise-product-os-dependency-v1" as const;

export const PRODUCT_OS_POLICY_FREEZE_TAG =
  "product-os-policy-freeze-1" as const;

export const OS_POLICY_KINDS = [
  "ACCESS",
  "LIFECYCLE",
  "SAFETY",
  "INTERNAL",
] as const;

export const OS_POLICY_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const OS_POLICY_RULE_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const OS_POLICY_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const OS_POLICY_ENFORCEMENTS = [
  "DECLARATIVE",
  "GATE",
  "AUDIT_ONLY",
] as const;

export const OS_POLICY_CONSTRAINTS = [
  "DEPENDENCY_ACYCLIC",
  "CATALOG_COMPLETE",
  "ACCESS_CONTROL",
  "INTERNAL",
] as const;

export const OS_POLICY_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
