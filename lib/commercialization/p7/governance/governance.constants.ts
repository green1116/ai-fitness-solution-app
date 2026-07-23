/**
 * Commercialization P7 — Commercial Governance constants
 * BASE: enterprise-commercialization-p6-revenue-intelligence-v1
 * Isolated namespace: lib/commercialization/p7
 */

export const COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_ID =
  "enterprise-commercialization-p7-commercial-governance-v1" as const;

export const COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_VERSION =
  "commercialization-p7-1" as const;

export const COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_FREEZE_VERSION =
  "commercialization-commercial-governance-freeze-1" as const;

export const COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_BASE =
  "enterprise-commercialization-p6-revenue-intelligence-v1" as const;

export const COMMERCIALIZATION_P7_GOVERNANCE_FREEZE_VERSION =
  "commercialization-p7-commercial-governance-freeze-1" as const;

export const GOVERNANCE_SCOPES = [
  "PRICING",
  "CONTRACT",
  "DISCOUNT",
  "EXCEPTION",
] as const;

export const GOVERNANCE_POLICY_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "SUSPENDED",
  "RETIRED",
] as const;

export const APPROVAL_STATES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "ESCALATED",
] as const;

export const RISK_LEVELS = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export const AUDIT_EVENT_KINDS = [
  "POLICY",
  "APPROVAL",
  "RISK",
  "COMPLIANCE",
] as const;

export const COMPLIANCE_VERDICTS = [
  "COMPLIANT",
  "PARTIAL",
  "NON_COMPLIANT",
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
