/**
 * Product M14 — Intelligence Lifecycle Runtime constants
 * MODULE: Enterprise Intelligence Lifecycle (M14-P7)
 * BASE: enterprise-product-intelligence-governance-v1
 * Isolated namespace: lib/product/m14/lifecycle-runtime
 * (bare lifecycle/ forbidden by M14-P1..P6 verify)
 * Definition only — no DB / vector / RAG / embedding / intelligence execution
 */

export const PRODUCT_INTELLIGENCE_LIFECYCLE_ID =
  "enterprise-product-intelligence-lifecycle-v1" as const;

export const PRODUCT_INTELLIGENCE_LIFECYCLE_VERSION =
  "product-intelligence-lifecycle-1" as const;

export const PRODUCT_INTELLIGENCE_LIFECYCLE_FREEZE_VERSION =
  "product-intelligence-lifecycle-freeze-1" as const;

export const PRODUCT_INTELLIGENCE_LIFECYCLE_BASE =
  "enterprise-product-intelligence-governance-v1" as const;

export const PRODUCT_INTELLIGENCE_LIFECYCLE_FREEZE_TAG =
  "product-intelligence-lifecycle-freeze-1" as const;

export const INTELLIGENCE_LIFECYCLE_PLAN_KINDS = [
  "DOMAIN",
  "LENS",
  "PORTFOLIO",
  "INTERNAL",
] as const;

export const INTELLIGENCE_LIFECYCLE_PLAN_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const INTELLIGENCE_LIFECYCLE_STATES = [
  "ACTIVE",
  "DEPRECATED",
  "MAINTENANCE",
  "ARCHIVED",
] as const;

export const INTELLIGENCE_LIFECYCLE_TRANSITION_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const INTELLIGENCE_LIFECYCLE_TRIGGERS = [
  "MANUAL",
  "SCHEDULE",
  "GOVERNANCE",
  "INTERNAL",
] as const;

export const INTELLIGENCE_LIFECYCLE_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const INTELLIGENCE_LIFECYCLE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
