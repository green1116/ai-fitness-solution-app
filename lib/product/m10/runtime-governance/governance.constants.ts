/**
 * Product M10 — AI Runtime Governance constants
 * MODULE: Runtime Governance (M10-P6)
 * BASE: enterprise-product-ai-resource-manager-v1
 * Isolated namespace: lib/product/m10/runtime-governance
 * Definition only — no allocation / execution / monitoring
 */

export const PRODUCT_AI_RUNTIME_GOVERNANCE_ID =
  "enterprise-product-ai-runtime-governance-v1" as const;

export const PRODUCT_AI_RUNTIME_GOVERNANCE_VERSION =
  "product-ai-runtime-governance-1" as const;

export const PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_VERSION =
  "product-ai-runtime-governance-freeze-1" as const;

export const PRODUCT_AI_RUNTIME_GOVERNANCE_BASE =
  "enterprise-product-ai-resource-manager-v1" as const;

export const PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_TAG =
  "product-ai-runtime-governance-freeze-1" as const;

export const AI_RUNTIME_GOVERNANCE_POLICY_KINDS = [
  "JOB_BOUNDARY",
  "QUEUE_CONTROL",
  "SCHEDULE_SCOPE",
  "RESOURCE_LIMIT",
] as const;

export const AI_RUNTIME_GOVERNANCE_POLICY_STATUSES = [
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AI_RUNTIME_GOVERNANCE_STANDARD_LEVELS = [
  "REQUIRED",
  "RECOMMENDED",
  "OPTIONAL",
] as const;

export const AI_RUNTIME_GOVERNANCE_REVIEW_VERDICTS = [
  "APPROVED",
  "REJECTED",
  "PENDING",
] as const;

export const AI_RUNTIME_GOVERNANCE_COMPLIANCE_VERDICTS = [
  "COMPLIANT",
  "NON_COMPLIANT",
  "WAIVED",
] as const;

export const AI_RUNTIME_GOVERNANCE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
