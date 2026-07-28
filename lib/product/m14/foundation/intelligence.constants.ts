/**
 * Product M14 — Enterprise Intelligence Foundation constants
 * MODULE: Enterprise Intelligence Foundation (M14-P1)
 * BASE: enterprise-product-os-baseline-v1
 * Isolated namespace: lib/product/m14/foundation
 * Foundation only — no intelligence execution / provider / model / DB / vector runtime
 */

export const PRODUCT_INTELLIGENCE_FOUNDATION_ID =
  "enterprise-product-intelligence-foundation-v1" as const;

export const PRODUCT_INTELLIGENCE_FOUNDATION_VERSION =
  "product-intelligence-1" as const;

export const PRODUCT_INTELLIGENCE_FOUNDATION_FREEZE_VERSION =
  "product-intelligence-foundation-freeze-1" as const;

export const PRODUCT_INTELLIGENCE_FOUNDATION_BASE =
  "enterprise-product-os-baseline-v1" as const;

export const PRODUCT_INTELLIGENCE_FREEZE_TAG =
  "product-intelligence-foundation-freeze-1" as const;

export const INTELLIGENCE_LENS_KINDS = [
  "DECISION",
  "FORECAST",
  "OPTIMIZATION",
  "INSIGHT",
  "EXECUTIVE",
  "INTERNAL",
] as const;

export const INTELLIGENCE_LENS_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const INTELLIGENCE_CAPABILITY_KINDS = [
  "ANALYZE",
  "FORECAST",
  "OPTIMIZE",
  "DECIDE",
  "OBSERVE",
  "INTERNAL",
] as const;

export const INTELLIGENCE_CAPABILITY_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const INTELLIGENCE_DOMAIN_SCOPES = [
  "PLATFORM",
  "PRODUCT",
  "DOMAIN",
  "INTERNAL",
] as const;

export const INTELLIGENCE_ANALYSIS_MODES = [
  "DECLARED",
  "ROUTINE",
  "HANDSHAKE",
] as const;

export const INTELLIGENCE_GOVERNANCE_POLICY_KINDS = [
  "ACCESS_CONTROL",
  "LIFECYCLE",
  "SAFETY",
  "INTERNAL",
] as const;

export const INTELLIGENCE_GOVERNANCE_POLICY_STATUSES = [
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const INTELLIGENCE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
