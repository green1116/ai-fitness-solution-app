/**
 * Product M09 — AI Governance constants
 * MODULE: AI Governance (M09-P6)
 * BASE: enterprise-product-ai-orchestration-v1
 * Isolated namespace: lib/product/m09/governance
 * Declaration only — no runtime / execution / agent / tools
 */

export const PRODUCT_AI_GOVERNANCE_ID =
  "enterprise-product-ai-governance-v1" as const;

export const PRODUCT_AI_GOVERNANCE_VERSION =
  "product-ai-governance-1" as const;

export const PRODUCT_AI_GOVERNANCE_FREEZE_VERSION =
  "product-ai-governance-freeze-1" as const;

export const PRODUCT_AI_GOVERNANCE_BASE =
  "enterprise-product-ai-orchestration-v1" as const;

export const PRODUCT_AI_GOVERNANCE_FREEZE_TAG =
  "product-ai-governance-freeze-1" as const;

export const AI_GOVERNANCE_POLICY_KINDS = [
  "MODEL_BOUNDARY",
  "PROMPT_SAFETY",
  "WORKFLOW_CONTROL",
  "ORCHESTRATION_SCOPE",
] as const;

export const AI_GOVERNANCE_POLICY_STATUSES = [
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AI_GOVERNANCE_STANDARD_LEVELS = [
  "REQUIRED",
  "RECOMMENDED",
  "OPTIONAL",
] as const;

export const AI_GOVERNANCE_REVIEW_VERDICTS = [
  "APPROVED",
  "REJECTED",
  "PENDING",
] as const;

export const AI_GOVERNANCE_COMPLIANCE_VERDICTS = [
  "COMPLIANT",
  "NON_COMPLIANT",
  "WAIVED",
] as const;

export const AI_GOVERNANCE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
