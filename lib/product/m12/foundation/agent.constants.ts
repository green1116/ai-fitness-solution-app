/**
 * Product M12 — AI Agent Platform Foundation constants
 * MODULE: AI Agent Platform Foundation (M12-P1)
 * BASE: enterprise-product-knowledge-baseline-v1
 * Isolated namespace: lib/product/m12/foundation
 * Foundation only — no agent execution / provider / model / workflow / tool runtime
 */

export const PRODUCT_AGENT_FOUNDATION_ID =
  "enterprise-product-agent-foundation-v1" as const;

export const PRODUCT_AGENT_FOUNDATION_VERSION = "product-agent-1" as const;

export const PRODUCT_AGENT_FOUNDATION_FREEZE_VERSION =
  "product-agent-foundation-freeze-1" as const;

export const PRODUCT_AGENT_FOUNDATION_BASE =
  "enterprise-product-knowledge-baseline-v1" as const;

export const PRODUCT_AGENT_FREEZE_TAG =
  "product-agent-foundation-freeze-1" as const;

export const AGENT_ROLES = [
  "PLANNER",
  "WORKER",
  "CRITIC",
  "COORDINATOR",
  "MEMORY",
  "INTERNAL",
] as const;

export const AGENT_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AGENT_CAPABILITY_KINDS = [
  "PLAN",
  "EVALUATE",
  "REMEMBER",
  "INVOKE",
  "ORCHESTRATE",
  "INTERNAL",
] as const;

export const AGENT_CAPABILITY_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AGENT_DOMAIN_SCOPES = [
  "PLATFORM",
  "PRODUCT",
  "DOMAIN",
  "INTERNAL",
] as const;

export const AGENT_INVOCATION_MODES = [
  "DECLARED",
  "ROUTINE",
  "HANDSHAKE",
] as const;

export const AGENT_GOVERNANCE_POLICY_KINDS = [
  "ACCESS_CONTROL",
  "LIFECYCLE",
  "SAFETY",
  "INTERNAL",
] as const;

export const AGENT_GOVERNANCE_POLICY_STATUSES = [
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AGENT_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
