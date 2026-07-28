/**
 * Product M15 — Evolution Feedback Platform constants
 * MODULE: Enterprise Evolution Feedback (M15-P2)
 * BASE: enterprise-product-evolution-foundation-v1
 * Isolated namespace: lib/product/m15/feedback
 * Feedback only — no learning / optimization / AI analysis / DB / vector runtime
 */

export const PRODUCT_EVOLUTION_FEEDBACK_ID =
  "enterprise-product-evolution-feedback-v1" as const;

export const PRODUCT_EVOLUTION_FEEDBACK_VERSION =
  "product-evolution-feedback-1" as const;

export const PRODUCT_EVOLUTION_FEEDBACK_FREEZE_VERSION =
  "product-evolution-feedback-freeze-1" as const;

export const PRODUCT_EVOLUTION_FEEDBACK_BASE =
  "enterprise-product-evolution-foundation-v1" as const;

export const PRODUCT_EVOLUTION_FEEDBACK_FREEZE_TAG =
  "product-evolution-feedback-freeze-1" as const;

export const EVOLUTION_FEEDBACK_KINDS = [
  "SIGNAL",
  "RATING",
  "COMMENT",
  "INCIDENT",
  "SURVEY",
  "INTERNAL",
] as const;

export const EVOLUTION_FEEDBACK_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const EVOLUTION_FEEDBACK_CAPABILITY_KINDS = [
  "CAPTURE",
  "ROUTE",
  "ACKNOWLEDGE",
  "ARCHIVE",
  "OBSERVE",
  "INTERNAL",
] as const;

export const EVOLUTION_FEEDBACK_CAPABILITY_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const EVOLUTION_FEEDBACK_DOMAIN_SCOPES = [
  "PLATFORM",
  "PRODUCT",
  "DOMAIN",
  "INTERNAL",
] as const;

export const EVOLUTION_FEEDBACK_INTAKE_MODES = [
  "DECLARED",
  "ROUTINE",
  "HANDSHAKE",
] as const;

export const EVOLUTION_FEEDBACK_GOVERNANCE_POLICY_KINDS = [
  "ACCESS_CONTROL",
  "LIFECYCLE",
  "SAFETY",
  "INTERNAL",
] as const;

export const EVOLUTION_FEEDBACK_GOVERNANCE_POLICY_STATUSES = [
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const EVOLUTION_FEEDBACK_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
