/**
 * Product M14 — Intelligence Governance constants
 * MODULE: Enterprise Intelligence Governance (M14-P6)
 * BASE: enterprise-product-intelligence-compatibility-v1
 * Isolated namespace: lib/product/m14/governance
 * (governance-runtime forbidden by M14-P5; bare governance matches frozen pattern)
 * Definition only — no DB / vector / RAG / embedding / intelligence execution
 */

export const PRODUCT_INTELLIGENCE_GOVERNANCE_ID =
  "enterprise-product-intelligence-governance-v1" as const;

export const PRODUCT_INTELLIGENCE_GOVERNANCE_VERSION =
  "product-intelligence-governance-1" as const;

export const PRODUCT_INTELLIGENCE_GOVERNANCE_FREEZE_VERSION =
  "product-intelligence-governance-freeze-1" as const;

export const PRODUCT_INTELLIGENCE_GOVERNANCE_BASE =
  "enterprise-product-intelligence-compatibility-v1" as const;

export const PRODUCT_INTELLIGENCE_GOVERNANCE_FREEZE_TAG =
  "product-intelligence-governance-freeze-1" as const;

export const INTELLIGENCE_GOVERNANCE_STANDARD_KINDS = [
  "REVIEW",
  "APPROVAL",
  "FREEZE",
  "INTERNAL",
] as const;

export const INTELLIGENCE_GOVERNANCE_STANDARD_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const INTELLIGENCE_GOVERNANCE_REVIEW_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const INTELLIGENCE_GOVERNANCE_APPROVALS = [
  "REQUIRED",
  "APPROVED",
  "WAIVED",
  "REJECTED",
] as const;

export const INTELLIGENCE_GOVERNANCE_RISK_LEVELS = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export const INTELLIGENCE_GOVERNANCE_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const INTELLIGENCE_GOVERNANCE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
