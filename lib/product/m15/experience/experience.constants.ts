/**
 * Product M15 — Evolution Experience Platform constants
 * MODULE: Enterprise Evolution Experience (M15-P3)
 * BASE: enterprise-product-evolution-feedback-v1
 * Isolated namespace: lib/product/m15/experience
 * Experience only — no learning / optimization / AI analysis / DB / vector runtime
 */

export const PRODUCT_EVOLUTION_EXPERIENCE_ID =
  "enterprise-product-evolution-experience-v1" as const;

export const PRODUCT_EVOLUTION_EXPERIENCE_VERSION =
  "product-evolution-experience-1" as const;

export const PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_VERSION =
  "product-evolution-experience-freeze-1" as const;

export const PRODUCT_EVOLUTION_EXPERIENCE_BASE =
  "enterprise-product-evolution-feedback-v1" as const;

export const PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_TAG =
  "product-evolution-experience-freeze-1" as const;

export const EVOLUTION_EXPERIENCE_KINDS = [
  "JOURNEY",
  "TOUCHPOINT",
  "SESSION",
  "FLOW",
  "MOMENT",
  "INTERNAL",
] as const;

export const EVOLUTION_EXPERIENCE_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const EVOLUTION_EXPERIENCE_CAPABILITY_KINDS = [
  "RECORD",
  "MAP",
  "TRACE",
  "ARCHIVE",
  "OBSERVE",
  "INTERNAL",
] as const;

export const EVOLUTION_EXPERIENCE_CAPABILITY_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const EVOLUTION_EXPERIENCE_DOMAIN_SCOPES = [
  "PLATFORM",
  "PRODUCT",
  "DOMAIN",
  "INTERNAL",
] as const;

export const EVOLUTION_EXPERIENCE_EXPOSURE_MODES = [
  "DECLARED",
  "ROUTINE",
  "HANDSHAKE",
] as const;

export const EVOLUTION_EXPERIENCE_GOVERNANCE_POLICY_KINDS = [
  "ACCESS_CONTROL",
  "LIFECYCLE",
  "SAFETY",
  "INTERNAL",
] as const;

export const EVOLUTION_EXPERIENCE_GOVERNANCE_POLICY_STATUSES = [
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const EVOLUTION_EXPERIENCE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
