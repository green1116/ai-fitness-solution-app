/**
 * Product M12 — Agent Governance constants
 * MODULE: Agent Governance (M12-P6)
 * BASE: enterprise-product-agent-compatibility-v1
 * Isolated namespace: lib/product/m12/governance
 * Definition only — no DB / vector / RAG / embedding / agent execution
 */

export const PRODUCT_AGENT_GOVERNANCE_ID =
  "enterprise-product-agent-governance-v1" as const;

export const PRODUCT_AGENT_GOVERNANCE_VERSION =
  "product-agent-governance-1" as const;

export const PRODUCT_AGENT_GOVERNANCE_FREEZE_VERSION =
  "product-agent-governance-freeze-1" as const;

export const PRODUCT_AGENT_GOVERNANCE_BASE =
  "enterprise-product-agent-compatibility-v1" as const;

export const PRODUCT_AGENT_GOVERNANCE_FREEZE_TAG =
  "product-agent-governance-freeze-1" as const;

export const AGENT_GOVERNANCE_STANDARD_KINDS = [
  "REVIEW",
  "APPROVAL",
  "FREEZE",
  "INTERNAL",
] as const;

export const AGENT_GOVERNANCE_STANDARD_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AGENT_GOVERNANCE_REVIEW_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AGENT_GOVERNANCE_APPROVALS = [
  "REQUIRED",
  "APPROVED",
  "WAIVED",
  "REJECTED",
] as const;

export const AGENT_GOVERNANCE_RISK_LEVELS = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export const AGENT_GOVERNANCE_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const AGENT_GOVERNANCE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
