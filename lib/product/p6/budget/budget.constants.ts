/**
 * Product P6 — Budget & ROI constants
 * BASE: enterprise-product-p5-ai-proposal-generation-v1
 * Isolated namespace: lib/product/p6
 */

export const PRODUCT_P6_BUDGET_ROI_ID =
  "enterprise-product-p6-budget-roi-v1" as const;

export const PRODUCT_P6_BUDGET_ROI_VERSION = "product-p6-1" as const;

export const PRODUCT_P6_BUDGET_ROI_FREEZE_VERSION =
  "product-p6-budget-roi-freeze-1" as const;

export const PRODUCT_P6_BUDGET_ROI_BASE =
  "enterprise-product-p5-ai-proposal-generation-v1" as const;

export const PRODUCT_P6_BUDGET_FREEZE_VERSION =
  "product-p6-budget-roi-freeze-1" as const;

export const BUDGET_STATUSES = [
  "DRAFT",
  "MODELING",
  "READY",
  "APPROVED",
  "ARCHIVED",
] as const;

export const COST_MODEL_KINDS = [
  "FIXED",
  "VARIABLE",
  "HYBRID",
  "USAGE",
  "TIERED",
] as const;

export const INVESTMENT_CATEGORIES = [
  "CAPEX",
  "OPEX",
  "IMPLEMENTATION",
  "TRAINING",
  "SUPPORT",
] as const;

export const ROI_STATUSES = [
  "PENDING",
  "CALCULATED",
  "REVIEWED",
] as const;

export const SCENARIO_KINDS = [
  "BASE",
  "OPTIMISTIC",
  "PESSIMISTIC",
  "CUSTOM",
] as const;

export const PRICING_MODELS = [
  "SUBSCRIPTION",
  "PER_SEAT",
  "USAGE",
  "HYBRID",
  "ONE_TIME",
] as const;

export const P6_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const P6_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
