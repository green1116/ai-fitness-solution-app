/**
 * Product M13 — OS Lifecycle Runtime constants
 * MODULE: OS Lifecycle (M13-P7)
 * BASE: enterprise-product-os-governance-v1
 * Isolated namespace: lib/product/m13/lifecycle-runtime
 * (bare lifecycle/ forbidden by M13-P1..P6 verify)
 * Definition only — no DB / vector / RAG / embedding / OS execution
 */

export const PRODUCT_OS_LIFECYCLE_ID =
  "enterprise-product-os-lifecycle-v1" as const;

export const PRODUCT_OS_LIFECYCLE_VERSION = "product-os-lifecycle-1" as const;

export const PRODUCT_OS_LIFECYCLE_FREEZE_VERSION =
  "product-os-lifecycle-freeze-1" as const;

export const PRODUCT_OS_LIFECYCLE_BASE =
  "enterprise-product-os-governance-v1" as const;

export const PRODUCT_OS_LIFECYCLE_FREEZE_TAG =
  "product-os-lifecycle-freeze-1" as const;

export const OS_LIFECYCLE_PLAN_KINDS = [
  "DOMAIN",
  "SURFACE",
  "FLEET",
  "INTERNAL",
] as const;

export const OS_LIFECYCLE_PLAN_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const OS_LIFECYCLE_STATES = [
  "ACTIVE",
  "DEPRECATED",
  "MAINTENANCE",
  "ARCHIVED",
] as const;

export const OS_LIFECYCLE_TRANSITION_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const OS_LIFECYCLE_TRIGGERS = [
  "MANUAL",
  "SCHEDULE",
  "GOVERNANCE",
  "INTERNAL",
] as const;

export const OS_LIFECYCLE_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const OS_LIFECYCLE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
