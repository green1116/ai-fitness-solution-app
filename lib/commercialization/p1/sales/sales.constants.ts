/**
 * Commercialization P1 — Sales Foundation constants
 * BASE: enterprise-evolution-complete-v1
 * Isolated namespace: lib/commercialization/p1
 */

export const COMMERCIALIZATION_SALES_FOUNDATION_ID =
  "enterprise-commercialization-p1-sales-foundation-v1" as const;

export const COMMERCIALIZATION_SALES_FOUNDATION_VERSION =
  "commercialization-p1-1" as const;

export const COMMERCIALIZATION_SALES_FOUNDATION_FREEZE_VERSION =
  "commercialization-sales-foundation-freeze-1" as const;

export const COMMERCIALIZATION_SALES_FOUNDATION_BASE =
  "enterprise-evolution-complete-v1" as const;

export const COMMERCIALIZATION_P1_SALES_FREEZE_VERSION =
  "commercialization-p1-sales-foundation-freeze-1" as const;

export const PIPELINE_STAGES = [
  "LEAD",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST",
] as const;

export const OPPORTUNITY_STATUSES = [
  "OPEN",
  "WON",
  "LOST",
  "ON_HOLD",
] as const;

export const CUSTOMER_LIFECYCLE_STAGES = [
  "PROSPECT",
  "ACTIVE",
  "EXPANSION",
  "CHURN_RISK",
  "CHURNED",
] as const;

export const OFFER_KINDS = [
  "PLAN",
  "ADDON",
  "BUNDLE",
  "SERVICE",
] as const;

export const PRICING_MODELS = [
  "FLAT",
  "PER_SEAT",
  "USAGE",
  "TIERED",
] as const;

export const SALES_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const SALES_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
