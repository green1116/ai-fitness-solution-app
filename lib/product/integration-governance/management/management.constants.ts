/**
 * Product Integration Governance — constants
 * MODULE: Integration Governance (M08-P6)
 * BASE: enterprise-product-marketplace-surface-v1
 * Isolated namespace: lib/product/integration-governance
 */

export const PRODUCT_INTEGRATION_GOVERNANCE_ID =
  "enterprise-product-integration-governance-v1" as const;

export const PRODUCT_INTEGRATION_GOVERNANCE_VERSION =
  "product-integration-governance-1" as const;

export const PRODUCT_INTEGRATION_GOVERNANCE_FREEZE_VERSION =
  "product-integration-governance-freeze-1" as const;

export const PRODUCT_INTEGRATION_GOVERNANCE_BASE =
  "enterprise-product-marketplace-surface-v1" as const;

export const PRODUCT_INTEGRATION_GOVERNANCE_FREEZE_TAG =
  "product-integration-governance-freeze-1" as const;

export const INTEGRATION_GOVERNANCE_POLICY_KINDS = [
  "CONNECTOR_BOUNDARY",
  "APP_COMPATIBILITY",
  "SURFACE_LISTING",
  "DATA_CONTRACT",
] as const;

export const INTEGRATION_GOVERNANCE_POLICY_STATUSES = [
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const INTEGRATION_GOVERNANCE_STANDARD_LEVELS = [
  "REQUIRED",
  "RECOMMENDED",
  "OPTIONAL",
] as const;

export const INTEGRATION_GOVERNANCE_REVIEW_VERDICTS = [
  "APPROVED",
  "REJECTED",
  "PENDING",
] as const;

export const INTEGRATION_GOVERNANCE_COMPLIANCE_VERDICTS = [
  "COMPLIANT",
  "NON_COMPLIANT",
  "WAIVED",
] as const;

export const INTEGRATION_GOVERNANCE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const INTEGRATION_GOVERNANCE_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
