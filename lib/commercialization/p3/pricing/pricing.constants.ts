/**
 * Commercialization P3 — Pricing & Contract Foundation constants
 * BASE: enterprise-commercialization-p2-product-packaging-foundation-v1
 * Isolated namespace: lib/commercialization/p3
 */

export const COMMERCIALIZATION_PRICING_CONTRACT_ID =
  "enterprise-commercialization-p3-pricing-contract-foundation-v1" as const;

export const COMMERCIALIZATION_PRICING_CONTRACT_VERSION =
  "commercialization-p3-1" as const;

export const COMMERCIALIZATION_PRICING_CONTRACT_FREEZE_VERSION =
  "commercialization-pricing-contract-foundation-freeze-1" as const;

export const COMMERCIALIZATION_PRICING_CONTRACT_BASE =
  "enterprise-commercialization-p2-product-packaging-foundation-v1" as const;

export const COMMERCIALIZATION_P3_PRICING_FREEZE_VERSION =
  "commercialization-p3-pricing-contract-foundation-freeze-1" as const;

export const PRICE_BOOK_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "RETIRED",
] as const;

export const BILLING_CYCLES = [
  "MONTHLY",
  "QUARTERLY",
  "ANNUAL",
] as const;

export const QUOTE_STATUSES = [
  "DRAFT",
  "COMPOSED",
  "SENT",
  "ACCEPTED",
  "EXPIRED",
] as const;

export const CONTRACT_STATUSES = [
  "DRAFT",
  "PENDING",
  "ACTIVE",
  "SUSPENDED",
  "TERMINATED",
  "EXPIRED",
] as const;

export const TERM_KINDS = [
  "PAYMENT",
  "SLA",
  "RENEWAL",
  "LIABILITY",
  "USAGE",
] as const;

export const COMMERCIAL_MODELS = [
  "SUBSCRIPTION",
  "USAGE_BASED",
  "HYBRID",
  "ONE_TIME",
] as const;

export const PRICING_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const PRICING_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
