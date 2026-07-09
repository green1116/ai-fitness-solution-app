/**
 * V80 PRODUCT P1 — Pricing model (feature → plan → limits)
 * Aligns APP P4 BILLING_FEATURE_GATING_MATRIX + CODE P4 V80_COMMERCIAL_ROUTES
 */
import { BILLING_FEATURE_GATING_MATRIX } from "@/lib/app/v80/production.billing.spec";
import type { ProductPricingTier } from "./productization.types";

export const PRODUCT_PRICING_TIERS: ProductPricingTier[] = [
  {
    id: "PRD-PRC-001",
    plan: "BASIC",
    monthlyPriceUsd: 49,
    billingRef: "PRD-BIL-001",
    codeGateRef: "canGenerateQuote",
    required: true,
    features: [
      { key: "planGeneration", included: true, limit: "10/mo" },
      { key: "budgetGeneration", included: false, limit: "—" },
      { key: "tenderPackage", included: false, limit: "—" },
      { key: "proposalPdf", included: false, limit: "—" },
      { key: "workspaceLimit", included: true, limit: "1 workspace" },
    ],
  },
  {
    id: "PRD-PRC-002",
    plan: "PRO",
    monthlyPriceUsd: 299,
    billingRef: "PRD-BIL-003",
    codeGateRef: "canGenerateTender",
    required: true,
    features: [
      { key: "planGeneration", included: true, limit: "50/mo" },
      { key: "budgetGeneration", included: true, limit: "50/mo" },
      { key: "tenderPackage", included: true, limit: "50/mo" },
      { key: "proposalPdf", included: true, limit: "unlimited" },
      { key: "workspaceLimit", included: true, limit: "5 workspaces" },
    ],
  },
  {
    id: "PRD-PRC-003",
    plan: "ENTERPRISE",
    monthlyPriceUsd: "custom",
    billingRef: "PRD-BIL-005",
    codeGateRef: "enterpriseAdmin",
    required: true,
    features: [
      { key: "planGeneration", included: true, limit: "unlimited" },
      { key: "budgetGeneration", included: true, limit: "unlimited" },
      { key: "tenderPackage", included: true, limit: "unlimited" },
      { key: "proposalPdf", included: true, limit: "unlimited" },
      { key: "apiAccess", included: true, limit: "unlimited" },
      { key: "userLimit", included: true, limit: "unlimited users" },
    ],
  },
];

/** Feature → API route → usage type (CODE P4 commercial mapping) */
export const PRODUCT_FEATURE_API_MAP = [
  { feature: "planGeneration", routes: ["/api/v80/tender/intake"], usageType: "QUOTE", chargeCents: 0 },
  { feature: "budgetGeneration", routes: ["/api/v80/budget/calculate"], usageType: "BUDGET", chargeCents: 50 },
  { feature: "tenderPackage", routes: ["/api/v80/autopilot/job/run"], usageType: "TENDER", chargeCents: 200 },
  { feature: "proposalPdf", routes: ["/api/v80/proposal-pdf/render", "/api/v80/pdf"], usageType: "PDF", chargeCents: 25 },
] as const;

export function isProductPricingComplete(): boolean {
  const plans = new Set(PRODUCT_PRICING_TIERS.map((p) => p.plan));
  const billingIds = new Set(BILLING_FEATURE_GATING_MATRIX.map((b) => b.id));
  return (
    PRODUCT_PRICING_TIERS.length === 3 &&
    plans.has("BASIC") &&
    plans.has("PRO") &&
    plans.has("ENTERPRISE") &&
    PRODUCT_PRICING_TIERS.every((p) => billingIds.has(p.billingRef) || p.plan === "ENTERPRISE") &&
    PRODUCT_FEATURE_API_MAP.length === 4
  );
}

export function getPricingByPlan(plan: ProductPricingTier["plan"]) {
  return PRODUCT_PRICING_TIERS.find((p) => p.plan === plan);
}
