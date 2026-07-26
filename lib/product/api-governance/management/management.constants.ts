/**
 * Product API Governance — constants
 * MODULE: API Governance (M07-P6)
 * BASE: enterprise-product-api-portal-v1
 * Isolated namespace: lib/product/api-governance
 */

export const PRODUCT_API_GOVERNANCE_ID =
  "enterprise-product-api-governance-v1" as const;

export const PRODUCT_API_GOVERNANCE_VERSION =
  "product-api-governance-1" as const;

export const PRODUCT_API_GOVERNANCE_FREEZE_VERSION =
  "product-api-governance-freeze-1" as const;

export const PRODUCT_API_GOVERNANCE_BASE =
  "enterprise-product-api-portal-v1" as const;

export const PRODUCT_API_GOVERNANCE_FREEZE_TAG =
  "product-api-governance-freeze-1" as const;

export const GOVERNANCE_POLICY_KINDS = [
  "NAMING",
  "VERSIONING",
  "SECURITY",
  "COMPATIBILITY",
] as const;

export const GOVERNANCE_POLICY_STATUSES = [
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const GOVERNANCE_STANDARD_LEVELS = [
  "REQUIRED",
  "RECOMMENDED",
  "OPTIONAL",
] as const;

export const GOVERNANCE_REVIEW_VERDICTS = [
  "APPROVED",
  "REJECTED",
  "PENDING",
] as const;

export const GOVERNANCE_COMPLIANCE_VERDICTS = [
  "COMPLIANT",
  "NON_COMPLIANT",
  "WAIVED",
] as const;

export const GOVERNANCE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const GOVERNANCE_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
