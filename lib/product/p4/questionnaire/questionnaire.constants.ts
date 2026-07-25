/**
 * Product P4 — Requirement Collection constants
 * BASE: enterprise-product-p3-ai-project-creation-v1
 * Isolated namespace: lib/product/p4
 */

export const PRODUCT_P4_REQUIREMENT_COLLECTION_ID =
  "enterprise-product-p4-requirement-collection-v1" as const;

export const PRODUCT_P4_REQUIREMENT_COLLECTION_VERSION =
  "product-p4-1" as const;

export const PRODUCT_P4_REQUIREMENT_COLLECTION_FREEZE_VERSION =
  "product-p4-requirement-collection-freeze-1" as const;

export const PRODUCT_P4_REQUIREMENT_COLLECTION_BASE =
  "enterprise-product-p3-ai-project-creation-v1" as const;

export const PRODUCT_P4_COLLECTION_FREEZE_VERSION =
  "product-p4-requirement-collection-freeze-1" as const;

export const QUESTIONNAIRE_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "CLOSED",
  "ARCHIVED",
] as const;

export const SURVEY_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "SUBMITTED",
  "REVIEWED",
] as const;

export const STAKEHOLDER_ROLES = [
  "OWNER",
  "SPONSOR",
  "OPERATOR",
  "COACH",
  "FACILITY",
  "FINANCE",
] as const;

export const CONSTRAINT_KINDS = [
  "SPACE",
  "BUDGET",
  "TIMELINE",
  "REGULATORY",
  "OPERATIONAL",
] as const;

export const SPACE_ANALYSIS_STATUSES = [
  "PENDING",
  "ANALYZED",
  "APPROVED",
] as const;

export const EQUIPMENT_PREFERENCE_LEVELS = [
  "REQUIRED",
  "PREFERRED",
  "OPTIONAL",
  "EXCLUDED",
] as const;

export const BUDGET_TARGET_STATUSES = [
  "PROPOSED",
  "APPROVED",
  "REVISED",
  "LOCKED",
] as const;

export const VALIDATION_VERDICTS = [
  "PASS",
  "FAIL",
  "WARN",
] as const;

export const P4_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const P4_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
