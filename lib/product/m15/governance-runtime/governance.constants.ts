/**
 * Product M15 — Evolution Governance constants
 * MODULE: Enterprise Evolution Governance (M15-P7)
 * BASE: enterprise-product-evolution-capability-v1
 * Isolated namespace: lib/product/m15/governance-runtime
 * Governance only — no deployment / execution / capability upgrade / DB / vector runtime
 */

export const PRODUCT_EVOLUTION_GOVERNANCE_ID =
  "enterprise-product-evolution-governance-v1" as const;

export const PRODUCT_EVOLUTION_GOVERNANCE_VERSION =
  "product-evolution-governance-1" as const;

export const PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_VERSION =
  "product-evolution-governance-freeze-1" as const;

export const PRODUCT_EVOLUTION_GOVERNANCE_BASE =
  "enterprise-product-evolution-capability-v1" as const;

export const PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_TAG =
  "product-evolution-governance-freeze-1" as const;

export const EVOLUTION_GOVERNANCE_FRAME_KINDS = [
  "OVERSIGHT",
  "COMPLIANCE",
  "REVIEW",
  "AUDIT",
  "FREEZE",
  "INTERNAL",
] as const;

export const EVOLUTION_GOVERNANCE_FRAME_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const EVOLUTION_GOVERNANCE_REVIEW_KINDS = [
  "DECLARE",
  "APPROVE",
  "REJECT",
  "ESCALATE",
  "OBSERVE",
  "INTERNAL",
] as const;

export const EVOLUTION_GOVERNANCE_REVIEW_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const EVOLUTION_GOVERNANCE_DOMAIN_SCOPES = [
  "PLATFORM",
  "PRODUCT",
  "DOMAIN",
  "INTERNAL",
] as const;

export const EVOLUTION_GOVERNANCE_OVERSIGHT_MODES = [
  "DECLARED",
  "ROUTINE",
  "HANDSHAKE",
] as const;

export const EVOLUTION_GOVERNANCE_CONTROL_POLICY_KINDS = [
  "ACCESS_CONTROL",
  "LIFECYCLE",
  "SAFETY",
  "INTERNAL",
] as const;

export const EVOLUTION_GOVERNANCE_CONTROL_POLICY_STATUSES = [
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const EVOLUTION_GOVERNANCE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
