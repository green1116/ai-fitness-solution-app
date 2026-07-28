/**
 * Product M15 — Evolution Optimization Engine constants
 * MODULE: Enterprise Evolution Optimization (M15-P5)
 * BASE: enterprise-product-evolution-learning-v1
 * Isolated namespace: lib/product/m15/optimization-runtime
 * (bare optimization/ forbidden by M15-P2..P4 verify)
 * Proposal only — no execution / deployment / automation / DB / vector runtime
 */

export const PRODUCT_EVOLUTION_OPTIMIZATION_ID =
  "enterprise-product-evolution-optimization-v1" as const;

export const PRODUCT_EVOLUTION_OPTIMIZATION_VERSION =
  "product-evolution-optimization-1" as const;

export const PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_VERSION =
  "product-evolution-optimization-freeze-1" as const;

export const PRODUCT_EVOLUTION_OPTIMIZATION_BASE =
  "enterprise-product-evolution-learning-v1" as const;

export const PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_TAG =
  "product-evolution-optimization-freeze-1" as const;

export const EVOLUTION_OPTIMIZATION_PROPOSAL_KINDS = [
  "COST",
  "LATENCY",
  "THROUGHPUT",
  "QUALITY",
  "RELIABILITY",
  "INTERNAL",
] as const;

export const EVOLUTION_OPTIMIZATION_PROPOSAL_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const EVOLUTION_OPTIMIZATION_CAPABILITY_KINDS = [
  "DRAFT",
  "SCORE",
  "COMPARE",
  "RANK",
  "OBSERVE",
  "INTERNAL",
] as const;

export const EVOLUTION_OPTIMIZATION_CAPABILITY_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const EVOLUTION_OPTIMIZATION_DOMAIN_SCOPES = [
  "PLATFORM",
  "PRODUCT",
  "DOMAIN",
  "INTERNAL",
] as const;

export const EVOLUTION_OPTIMIZATION_EVALUATION_MODES = [
  "DECLARED",
  "ROUTINE",
  "HANDSHAKE",
] as const;

export const EVOLUTION_OPTIMIZATION_GOVERNANCE_POLICY_KINDS = [
  "ACCESS_CONTROL",
  "LIFECYCLE",
  "SAFETY",
  "INTERNAL",
] as const;

export const EVOLUTION_OPTIMIZATION_GOVERNANCE_POLICY_STATUSES = [
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const EVOLUTION_OPTIMIZATION_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
