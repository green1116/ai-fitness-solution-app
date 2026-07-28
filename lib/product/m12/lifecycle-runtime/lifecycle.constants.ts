/**
 * Product M12 — Agent Lifecycle Runtime constants
 * MODULE: Agent Lifecycle (M12-P7)
 * BASE: enterprise-product-agent-governance-v1
 * Isolated namespace: lib/product/m12/lifecycle-runtime
 * Definition only — no DB / vector / RAG / embedding / agent execution
 */

export const PRODUCT_AGENT_LIFECYCLE_ID =
  "enterprise-product-agent-lifecycle-v1" as const;

export const PRODUCT_AGENT_LIFECYCLE_VERSION =
  "product-agent-lifecycle-1" as const;

export const PRODUCT_AGENT_LIFECYCLE_FREEZE_VERSION =
  "product-agent-lifecycle-freeze-1" as const;

export const PRODUCT_AGENT_LIFECYCLE_BASE =
  "enterprise-product-agent-governance-v1" as const;

export const PRODUCT_AGENT_LIFECYCLE_FREEZE_TAG =
  "product-agent-lifecycle-freeze-1" as const;

export const AGENT_LIFECYCLE_PLAN_KINDS = [
  "DOMAIN",
  "AGENT",
  "FLEET",
  "INTERNAL",
] as const;

export const AGENT_LIFECYCLE_PLAN_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AGENT_LIFECYCLE_STATES = [
  "ACTIVE",
  "DEPRECATED",
  "MAINTENANCE",
  "ARCHIVED",
] as const;

export const AGENT_LIFECYCLE_TRANSITION_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AGENT_LIFECYCLE_TRIGGERS = [
  "MANUAL",
  "SCHEDULE",
  "GOVERNANCE",
  "INTERNAL",
] as const;

export const AGENT_LIFECYCLE_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const AGENT_LIFECYCLE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
