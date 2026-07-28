/**
 * Product M11 — Knowledge Platform Foundation constants
 * MODULE: Knowledge Platform Foundation (M11-P1)
 * BASE: enterprise-product-ai-runtime-baseline-v1
 * Isolated namespace: lib/product/m11/foundation
 * Foundation only — no DB / vector / RAG / embedding / external deps
 */

export const PRODUCT_KNOWLEDGE_FOUNDATION_ID =
  "enterprise-product-knowledge-foundation-v1" as const;

export const PRODUCT_KNOWLEDGE_FOUNDATION_VERSION =
  "product-knowledge-1" as const;

export const PRODUCT_KNOWLEDGE_FOUNDATION_FREEZE_VERSION =
  "product-knowledge-foundation-freeze-1" as const;

export const PRODUCT_KNOWLEDGE_FOUNDATION_BASE =
  "enterprise-product-ai-runtime-baseline-v1" as const;

export const PRODUCT_KNOWLEDGE_FREEZE_TAG =
  "product-knowledge-foundation-freeze-1" as const;

export const KNOWLEDGE_ENTITY_KINDS = [
  "DOCUMENT",
  "FACT",
  "POLICY",
  "PROCEDURE",
  "TOPIC",
  "INTERNAL",
] as const;

export const KNOWLEDGE_ENTITY_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const KNOWLEDGE_ACCESS_LEVELS = [
  "PUBLIC",
  "INTERNAL",
  "RESTRICTED",
  "CONFIDENTIAL",
] as const;

export const KNOWLEDGE_DOMAIN_SCOPES = [
  "PLATFORM",
  "PRODUCT",
  "DOMAIN",
  "INTERNAL",
] as const;

export const KNOWLEDGE_RETRIEVAL_MODES = [
  "EXACT",
  "KEYWORD",
  "TAG",
] as const;

export const KNOWLEDGE_GOVERNANCE_POLICY_KINDS = [
  "ACCESS_CONTROL",
  "LIFECYCLE",
  "QUALITY",
  "CITATION",
] as const;

export const KNOWLEDGE_GOVERNANCE_POLICY_STATUSES = [
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const KNOWLEDGE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
