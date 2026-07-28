/**
 * Product M12 — Agent Compatibility Runtime constants
 * MODULE: Agent Compatibility (M12-P5)
 * BASE: enterprise-product-agent-policy-v1
 * Isolated namespace: lib/product/m12/compatibility-runtime
 * Definition only — no DB / vector / RAG / embedding / agent execution
 */

export const PRODUCT_AGENT_COMPATIBILITY_ID =
  "enterprise-product-agent-compatibility-v1" as const;

export const PRODUCT_AGENT_COMPATIBILITY_VERSION =
  "product-agent-compatibility-1" as const;

export const PRODUCT_AGENT_COMPATIBILITY_FREEZE_VERSION =
  "product-agent-compatibility-freeze-1" as const;

export const PRODUCT_AGENT_COMPATIBILITY_BASE =
  "enterprise-product-agent-policy-v1" as const;

export const PRODUCT_AGENT_COMPATIBILITY_FREEZE_TAG =
  "product-agent-compatibility-freeze-1" as const;

export const AGENT_COMPATIBILITY_MATRIX_KINDS = [
  "VERSION",
  "POLICY",
  "LAYER",
  "INTERNAL",
] as const;

export const AGENT_COMPATIBILITY_MATRIX_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AGENT_COMPATIBILITY_PAIR_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AGENT_COMPATIBILITY_RELATIONS = [
  "COMPATIBLE",
  "INCOMPATIBLE",
  "DEPRECATED",
  "SUPPORTED",
] as const;

export const AGENT_COMPATIBILITY_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const AGENT_COMPATIBILITY_CONSTRAINTS = [
  "VERSION_RANGE",
  "POLICY_GATE",
  "FALLBACK",
  "INTERNAL",
] as const;

export const AGENT_COMPATIBILITY_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
