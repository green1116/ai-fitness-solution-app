/**
 * Product M15 — Evolution Capability Evolution constants
 * MODULE: Enterprise Evolution Capability (M15-P6)
 * BASE: enterprise-product-evolution-optimization-v1
 * Isolated namespace: lib/product/m15/capability-runtime
 * Capability only — no deployment / execution / runtime activation / DB / vector runtime
 */

export const PRODUCT_EVOLUTION_CAPABILITY_ID =
  "enterprise-product-evolution-capability-v1" as const;

export const PRODUCT_EVOLUTION_CAPABILITY_VERSION =
  "product-evolution-capability-1" as const;

export const PRODUCT_EVOLUTION_CAPABILITY_FREEZE_VERSION =
  "product-evolution-capability-freeze-1" as const;

export const PRODUCT_EVOLUTION_CAPABILITY_BASE =
  "enterprise-product-evolution-optimization-v1" as const;

export const PRODUCT_EVOLUTION_CAPABILITY_FREEZE_TAG =
  "product-evolution-capability-freeze-1" as const;

export const EVOLUTION_CAPABILITY_SPEC_KINDS = [
  "CORE",
  "EXTENSION",
  "ADAPTER",
  "PORT",
  "INTERFACE",
  "INTERNAL",
] as const;

export const EVOLUTION_CAPABILITY_SPEC_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const EVOLUTION_CAPABILITY_REVISION_KINDS = [
  "DECLARE",
  "ADVANCE",
  "FREEZE",
  "VALIDATE",
  "OBSERVE",
  "INTERNAL",
] as const;

export const EVOLUTION_CAPABILITY_REVISION_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const EVOLUTION_CAPABILITY_DOMAIN_SCOPES = [
  "PLATFORM",
  "PRODUCT",
  "DOMAIN",
  "INTERNAL",
] as const;

export const EVOLUTION_CAPABILITY_ADVANCEMENT_MODES = [
  "DECLARED",
  "ROUTINE",
  "HANDSHAKE",
] as const;

export const EVOLUTION_CAPABILITY_GOVERNANCE_POLICY_KINDS = [
  "ACCESS_CONTROL",
  "LIFECYCLE",
  "SAFETY",
  "INTERNAL",
] as const;

export const EVOLUTION_CAPABILITY_GOVERNANCE_POLICY_STATUSES = [
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const EVOLUTION_CAPABILITY_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
