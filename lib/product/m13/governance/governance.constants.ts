/**
 * Product M13 — OS Governance constants
 * MODULE: OS Governance (M13-P6)
 * BASE: enterprise-product-os-compatibility-v1
 * Isolated namespace: lib/product/m13/governance
 * (governance-runtime forbidden by M13-P5; bare governance matches M12-P6)
 * Definition only — no DB / vector / RAG / embedding / OS execution
 */

export const PRODUCT_OS_GOVERNANCE_ID =
  "enterprise-product-os-governance-v1" as const;

export const PRODUCT_OS_GOVERNANCE_VERSION =
  "product-os-governance-1" as const;

export const PRODUCT_OS_GOVERNANCE_FREEZE_VERSION =
  "product-os-governance-freeze-1" as const;

export const PRODUCT_OS_GOVERNANCE_BASE =
  "enterprise-product-os-compatibility-v1" as const;

export const PRODUCT_OS_GOVERNANCE_FREEZE_TAG =
  "product-os-governance-freeze-1" as const;

export const OS_GOVERNANCE_STANDARD_KINDS = [
  "REVIEW",
  "APPROVAL",
  "FREEZE",
  "INTERNAL",
] as const;

export const OS_GOVERNANCE_STANDARD_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const OS_GOVERNANCE_REVIEW_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const OS_GOVERNANCE_APPROVALS = [
  "REQUIRED",
  "APPROVED",
  "WAIVED",
  "REJECTED",
] as const;

export const OS_GOVERNANCE_RISK_LEVELS = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export const OS_GOVERNANCE_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const OS_GOVERNANCE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
