/**
 * Product Compliance — Governance & Compliance constants
 * MODULE: Compliance
 * BASE: enterprise-product-operations-console-v1
 * Isolated namespace: lib/product/compliance
 */

export const PRODUCT_COMPLIANCE_GOVERNANCE_ID =
  "enterprise-product-compliance-governance-v1" as const;

export const PRODUCT_COMPLIANCE_GOVERNANCE_VERSION =
  "product-compliance-1" as const;

export const PRODUCT_COMPLIANCE_GOVERNANCE_FREEZE_VERSION =
  "product-compliance-governance-freeze-1" as const;

export const PRODUCT_COMPLIANCE_GOVERNANCE_BASE =
  "enterprise-product-operations-console-v1" as const;

export const PRODUCT_COMPLIANCE_FREEZE_VERSION =
  "product-compliance-governance-freeze-1" as const;

export const COMPLIANCE_FRAMEWORK_KINDS = [
  "SOC2",
  "ISO27001",
  "GDPR",
  "INTERNAL",
] as const;

export const COMPLIANCE_FRAMEWORK_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "RETIRED",
] as const;

export const COMPLIANCE_CONTROL_STATUSES = [
  "DEFINED",
  "IMPLEMENTED",
  "MONITORED",
] as const;

export const COMPLIANCE_EVIDENCE_KINDS = [
  "LOG",
  "DOCUMENT",
  "ATTESTATION",
] as const;

export const COMPLIANCE_ASSESSMENT_RESULTS = [
  "PASS",
  "GAP",
  "FAIL",
] as const;

export const COMPLIANCE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const COMPLIANCE_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
