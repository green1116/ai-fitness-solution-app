/**
 * Product P5 — AI Proposal Generation constants
 * BASE: enterprise-product-p4-requirement-collection-v1
 * Isolated namespace: lib/product/p5
 */

export const PRODUCT_P5_AI_PROPOSAL_GENERATION_ID =
  "enterprise-product-p5-ai-proposal-generation-v1" as const;

export const PRODUCT_P5_AI_PROPOSAL_GENERATION_VERSION =
  "product-p5-1" as const;

export const PRODUCT_P5_AI_PROPOSAL_GENERATION_FREEZE_VERSION =
  "product-p5-ai-proposal-generation-freeze-1" as const;

export const PRODUCT_P5_AI_PROPOSAL_GENERATION_BASE =
  "enterprise-product-p4-requirement-collection-v1" as const;

export const PRODUCT_P5_PROPOSAL_FREEZE_VERSION =
  "product-p5-ai-proposal-generation-freeze-1" as const;

export const PROPOSAL_STATUSES = [
  "DRAFT",
  "BUILDING",
  "READY",
  "DELIVERED",
  "ARCHIVED",
] as const;

export const PROPOSAL_TEMPLATE_KINDS = [
  "ENTERPRISE",
  "PILOT",
  "RENEWAL",
  "EXPANSION",
  "CUSTOM",
] as const;

export const PROPOSAL_SECTION_KINDS = [
  "EXECUTIVE_SUMMARY",
  "SOLUTION_OVERVIEW",
  "DIFFERENTIATOR",
  "SCOPE",
  "COMMERCIAL",
  "APPENDIX",
] as const;

export const BUILDER_STATUSES = [
  "IDLE",
  "ASSEMBLING",
  "COMPLETE",
  "FAILED",
] as const;

export const GENERATOR_STATUSES = [
  "PENDING",
  "GENERATED",
  "REVIEWED",
] as const;

export const P5_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const P5_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
