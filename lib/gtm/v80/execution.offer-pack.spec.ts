/**
 * V80 GTM P2 — Offer pack design (what is sold in first transaction)
 * Aligns PRODUCT P1 pricing + V80_COMMERCIAL_ROUTES charge mapping
 */
import { PRODUCT_PRICING_TIERS, PRODUCT_FEATURE_API_MAP } from "@/lib/product/v80/product.pricing.spec";
import type { OfferPackItem } from "./execution.types";

export const FIRST_DEAL_OFFER_PACK: OfferPackItem[] = [
  {
    id: "GTM-OFR-001",
    sku: "FITSCALE-PRO-ANNUAL",
    deliverable: "FitScale PRO — 12-month subscription (5 workspaces, 50 tenders/mo)",
    plan: "PRO",
    priceUsd: 3588,
    apiSurface: "/api/v80/tenant/run",
    includedInFirstDeal: true,
    required: true,
  },
  {
    id: "GTM-OFR-002",
    sku: "TENDER-RESPONSE-PACK",
    deliverable: "First live tender-pack-complete (plan + budget + proposal bundle)",
    plan: "PRO",
    priceUsd: "metered",
    apiSurface: "/api/v80/autopilot/job/run",
    includedInFirstDeal: true,
    required: true,
  },
  {
    id: "GTM-OFR-003",
    sku: "BUDGET-CALC-UNIT",
    deliverable: "Equipment budget calculation per quote",
    plan: "PRO",
    priceUsd: "metered",
    apiSurface: "/api/v80/budget/calculate",
    includedInFirstDeal: true,
    required: true,
  },
  {
    id: "GTM-OFR-004",
    sku: "PROPOSAL-PDF-UNIT",
    deliverable: "Client-ready proposal PDF artifact",
    plan: "PRO",
    priceUsd: "metered",
    apiSurface: "/api/v80/proposal-pdf/render",
    includedInFirstDeal: true,
    required: true,
  },
  {
    id: "GTM-OFR-005",
    sku: "PLAN-PDF-INCLUDED",
    deliverable: "Plan PDF download — activation deliverable (included in PRO)",
    plan: "PRO",
    priceUsd: 0,
    apiSurface: "/api/v80/pdf?type=plan",
    includedInFirstDeal: true,
    required: true,
  },
  {
    id: "GTM-OFR-006",
    sku: "GOVERNANCE-AUDIT-TRAIL",
    deliverable: "Entitlement enforcement audit log — procurement DD proof",
    plan: "PRO",
    priceUsd: 0,
    apiSurface: "/api/v80/ops/governance/audit",
    includedInFirstDeal: true,
    required: true,
  },
];

export function isFirstDealOfferPackComplete(): boolean {
  const proTier = PRODUCT_PRICING_TIERS.find((p) => p.plan === "PRO");

  return (
    FIRST_DEAL_OFFER_PACK.length === 6 &&
    FIRST_DEAL_OFFER_PACK.every((o) => o.includedInFirstDeal) &&
    FIRST_DEAL_OFFER_PACK.filter((o) => o.plan === "PRO").length >= 6 &&
    Boolean(proTier && proTier.monthlyPriceUsd === 299) &&
    PRODUCT_FEATURE_API_MAP.length === 4 &&
    FIRST_DEAL_OFFER_PACK.some((o) => o.apiSurface.includes("budget/calculate")) &&
    FIRST_DEAL_OFFER_PACK.some((o) => o.apiSurface.includes("autopilot"))
  );
}
