/**
 * Product M15 — Evolution Learning Engine constants
 * MODULE: Enterprise Evolution Learning (M15-P4)
 * BASE: enterprise-product-evolution-experience-v1
 * Isolated namespace: lib/product/m15/learning-runtime
 * (bare learning/ forbidden by M15-P2/P3 verify)
 * Learning only — no optimization / recommendation / execution / DB / vector runtime
 */

export const PRODUCT_EVOLUTION_LEARNING_ID =
  "enterprise-product-evolution-learning-v1" as const;

export const PRODUCT_EVOLUTION_LEARNING_VERSION =
  "product-evolution-learning-1" as const;

export const PRODUCT_EVOLUTION_LEARNING_FREEZE_VERSION =
  "product-evolution-learning-freeze-1" as const;

export const PRODUCT_EVOLUTION_LEARNING_BASE =
  "enterprise-product-evolution-experience-v1" as const;

export const PRODUCT_EVOLUTION_LEARNING_FREEZE_TAG =
  "product-evolution-learning-freeze-1" as const;

export const EVOLUTION_LEARNING_KINDS = [
  "PATTERN",
  "INSIGHT",
  "LESSON",
  "RULE",
  "MODEL",
  "INTERNAL",
] as const;

export const EVOLUTION_LEARNING_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const EVOLUTION_LEARNING_CAPABILITY_KINDS = [
  "CAPTURE",
  "ABSTRACT",
  "VALIDATE",
  "RETAIN",
  "OBSERVE",
  "INTERNAL",
] as const;

export const EVOLUTION_LEARNING_CAPABILITY_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const EVOLUTION_LEARNING_DOMAIN_SCOPES = [
  "PLATFORM",
  "PRODUCT",
  "DOMAIN",
  "INTERNAL",
] as const;

export const EVOLUTION_LEARNING_INSIGHT_MODES = [
  "DECLARED",
  "ROUTINE",
  "HANDSHAKE",
] as const;

export const EVOLUTION_LEARNING_GOVERNANCE_POLICY_KINDS = [
  "ACCESS_CONTROL",
  "LIFECYCLE",
  "SAFETY",
  "INTERNAL",
] as const;

export const EVOLUTION_LEARNING_GOVERNANCE_POLICY_STATUSES = [
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const EVOLUTION_LEARNING_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
