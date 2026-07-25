/**
 * Product P3 — AI Project Creation constants
 * BASE: enterprise-product-p2-organization-workspace-v1
 * Isolated namespace: lib/product/p3
 */

export const PRODUCT_P3_AI_PROJECT_CREATION_ID =
  "enterprise-product-p3-ai-project-creation-v1" as const;

export const PRODUCT_P3_AI_PROJECT_CREATION_VERSION =
  "product-p3-1" as const;

export const PRODUCT_P3_AI_PROJECT_CREATION_FREEZE_VERSION =
  "product-p3-ai-project-creation-freeze-1" as const;

export const PRODUCT_P3_AI_PROJECT_CREATION_BASE =
  "enterprise-product-p2-organization-workspace-v1" as const;

export const PRODUCT_P3_PROJECT_FREEZE_VERSION =
  "product-p3-ai-project-creation-freeze-1" as const;

export const PROJECT_STATUSES = [
  "DRAFT",
  "BRIEFED",
  "SCOPED",
  "ACTIVE",
  "COMPLETED",
  "ARCHIVED",
] as const;

export const PROJECT_TEMPLATE_KINDS = [
  "FITNESS_CENTER",
  "CORPORATE_WELLNESS",
  "SPORTS_PERFORMANCE",
  "REHAB",
  "CUSTOM",
] as const;

export const BRIEF_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
] as const;

export const SITE_STATUSES = [
  "PLANNED",
  "ACTIVE",
  "INACTIVE",
] as const;

export const FACILITY_KINDS = [
  "GYM",
  "STUDIO",
  "POOL",
  "COURT",
  "CLINIC",
  "OTHER",
] as const;

export const REQUIREMENT_PRIORITIES = [
  "P1",
  "P2",
  "P3",
  "P4",
] as const;

export const GOAL_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "ACHIEVED",
  "DROPPED",
] as const;

export const P3_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const P3_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
