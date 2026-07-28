/**
 * Product M11 — Knowledge Lifecycle Runtime constants
 * MODULE: Knowledge Lifecycle (M11-P7)
 * BASE: enterprise-product-knowledge-governance-v1
 * Isolated namespace: lib/product/m11/lifecycle-runtime
 * Definition only — no DB / vector / RAG / embedding / external deps
 */

export const PRODUCT_KNOWLEDGE_LIFECYCLE_ID =
  "enterprise-product-knowledge-lifecycle-v1" as const;

export const PRODUCT_KNOWLEDGE_LIFECYCLE_VERSION =
  "product-knowledge-lifecycle-1" as const;

export const PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION =
  "product-knowledge-lifecycle-freeze-1" as const;

export const PRODUCT_KNOWLEDGE_LIFECYCLE_BASE =
  "enterprise-product-knowledge-governance-v1" as const;

export const PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_TAG =
  "product-knowledge-lifecycle-freeze-1" as const;

export const KNOWLEDGE_LIFECYCLE_PLAN_KINDS = [
  "DOMAIN",
  "ENTITY",
  "CATALOG",
  "INTERNAL",
] as const;

export const KNOWLEDGE_LIFECYCLE_PLAN_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const KNOWLEDGE_LIFECYCLE_STATES = [
  "ACTIVE",
  "DEPRECATED",
  "MAINTENANCE",
  "ARCHIVED",
] as const;

export const KNOWLEDGE_LIFECYCLE_TRANSITION_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const KNOWLEDGE_LIFECYCLE_TRIGGERS = [
  "MANUAL",
  "SCHEDULE",
  "GOVERNANCE",
  "INTERNAL",
] as const;

export const KNOWLEDGE_LIFECYCLE_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const KNOWLEDGE_LIFECYCLE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
