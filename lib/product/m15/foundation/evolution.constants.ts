/**
 * Product M15 — Enterprise Evolution Foundation constants
 * MODULE: Enterprise Evolution Foundation (M15-P1)
 * BASE: enterprise-product-intelligence-baseline-v1
 * Isolated namespace: lib/product/m15/foundation
 * Foundation only — no evolution execution / provider / model / DB / vector runtime
 */

export const PRODUCT_EVOLUTION_FOUNDATION_ID =
  "enterprise-product-evolution-foundation-v1" as const;

export const PRODUCT_EVOLUTION_FOUNDATION_VERSION =
  "product-evolution-1" as const;

export const PRODUCT_EVOLUTION_FOUNDATION_FREEZE_VERSION =
  "product-evolution-foundation-freeze-1" as const;

export const PRODUCT_EVOLUTION_FOUNDATION_BASE =
  "enterprise-product-intelligence-baseline-v1" as const;

export const PRODUCT_EVOLUTION_FREEZE_TAG =
  "product-evolution-foundation-freeze-1" as const;

export const EVOLUTION_TRACK_KINDS = [
  "ADAPT",
  "MIGRATE",
  "SCALE",
  "OPTIMIZE",
  "RETIRE",
  "INTERNAL",
] as const;

export const EVOLUTION_TRACK_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const EVOLUTION_CAPABILITY_KINDS = [
  "PLAN",
  "APPLY",
  "VALIDATE",
  "ROLLBACK",
  "OBSERVE",
  "INTERNAL",
] as const;

export const EVOLUTION_CAPABILITY_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const EVOLUTION_DOMAIN_SCOPES = [
  "PLATFORM",
  "PRODUCT",
  "DOMAIN",
  "INTERNAL",
] as const;

export const EVOLUTION_PROGRESSION_MODES = [
  "DECLARED",
  "ROUTINE",
  "HANDSHAKE",
] as const;

export const EVOLUTION_GOVERNANCE_POLICY_KINDS = [
  "ACCESS_CONTROL",
  "LIFECYCLE",
  "SAFETY",
  "INTERNAL",
] as const;

export const EVOLUTION_GOVERNANCE_POLICY_STATUSES = [
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const EVOLUTION_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
