/**
 * Product M11 — Knowledge Governance constants
 * MODULE: Knowledge Governance (M11-P6)
 * BASE: enterprise-product-knowledge-compatibility-v1
 * Isolated namespace: lib/product/m11/governance
 * Definition only — no DB / vector / RAG / embedding / external deps
 */

export const PRODUCT_KNOWLEDGE_GOVERNANCE_ID =
  "enterprise-product-knowledge-governance-v1" as const;

export const PRODUCT_KNOWLEDGE_GOVERNANCE_VERSION =
  "product-knowledge-governance-1" as const;

export const PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION =
  "product-knowledge-governance-freeze-1" as const;

export const PRODUCT_KNOWLEDGE_GOVERNANCE_BASE =
  "enterprise-product-knowledge-compatibility-v1" as const;

export const PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_TAG =
  "product-knowledge-governance-freeze-1" as const;

export const KNOWLEDGE_GOVERNANCE_STANDARD_KINDS = [
  "REVIEW",
  "APPROVAL",
  "FREEZE",
  "INTERNAL",
] as const;

export const KNOWLEDGE_GOVERNANCE_STANDARD_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const KNOWLEDGE_GOVERNANCE_REVIEW_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const KNOWLEDGE_GOVERNANCE_APPROVALS = [
  "REQUIRED",
  "APPROVED",
  "WAIVED",
  "REJECTED",
] as const;

export const KNOWLEDGE_GOVERNANCE_RISK_LEVELS = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export const KNOWLEDGE_GOVERNANCE_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const KNOWLEDGE_GOVERNANCE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
