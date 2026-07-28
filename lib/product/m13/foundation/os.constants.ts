/**
 * Product M13 — Enterprise Operating System Foundation constants
 * MODULE: Enterprise Operating System Foundation (M13-P1)
 * BASE: enterprise-product-agent-baseline-v1
 * Isolated namespace: lib/product/m13/foundation
 * Foundation only — no OS execution / provider / workflow / tool / DB runtime
 */

export const PRODUCT_OS_FOUNDATION_ID =
  "enterprise-product-os-foundation-v1" as const;

export const PRODUCT_OS_FOUNDATION_VERSION = "product-os-1" as const;

export const PRODUCT_OS_FOUNDATION_FREEZE_VERSION =
  "product-os-foundation-freeze-1" as const;

export const PRODUCT_OS_FOUNDATION_BASE =
  "enterprise-product-agent-baseline-v1" as const;

export const PRODUCT_OS_FREEZE_TAG =
  "product-os-foundation-freeze-1" as const;

export const OS_SURFACE_KINDS = [
  "WORKSPACE",
  "CONTROL",
  "SERVICE",
  "DOMAIN",
  "BRIDGE",
  "INTERNAL",
] as const;

export const OS_SURFACE_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const OS_CAPABILITY_KINDS = [
  "ORCHESTRATE",
  "COORDINATE",
  "GOVERN",
  "OPERATE",
  "OBSERVE",
  "INTERNAL",
] as const;

export const OS_CAPABILITY_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const OS_DOMAIN_SCOPES = [
  "PLATFORM",
  "PRODUCT",
  "DOMAIN",
  "INTERNAL",
] as const;

export const OS_OPERATION_MODES = [
  "DECLARED",
  "ROUTINE",
  "HANDSHAKE",
] as const;

export const OS_GOVERNANCE_POLICY_KINDS = [
  "ACCESS_CONTROL",
  "LIFECYCLE",
  "SAFETY",
  "INTERNAL",
] as const;

export const OS_GOVERNANCE_POLICY_STATUSES = [
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const OS_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
