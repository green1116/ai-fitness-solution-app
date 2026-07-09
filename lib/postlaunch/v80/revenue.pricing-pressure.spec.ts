/**
 * V80 POST-LAUNCH P1 — Pricing pressure optimization (natural paywall points)
 * Aligns PRODUCT P1 limits + BILLING matrix + PRODUCT P2 EXPANSION_PATHS
 */
import { BILLING_FEATURE_GATING_MATRIX } from "@/lib/app/v80/production.billing.spec";
import { PRODUCT_PRICING_TIERS } from "@/lib/product/v80/product.pricing.spec";
import type { PricingPressurePoint } from "./revenue.types";

export const PRICING_PRESSURE_POINTS: PricingPressurePoint[] = [
  {
    id: "REV-PAY-001",
    plan: "BASIC",
    pressureType: "feature_gate",
    featureKey: "budgetGeneration",
    apiRoute: "/api/v80/budget/calculate",
    limitSignal: "included=false",
    gateCode: "FEATURE_GATE",
    targetPlan: "PRO",
    ctaRef: "PRD-CNV-001",
    chargeCents: 50,
    required: true,
  },
  {
    id: "REV-PAY-002",
    plan: "BASIC",
    pressureType: "feature_gate",
    featureKey: "tenderPackage",
    apiRoute: "/api/v80/autopilot/job/run",
    limitSignal: "included=false",
    gateCode: "FEATURE_GATE",
    targetPlan: "PRO",
    ctaRef: "PRD-CNV-002",
    chargeCents: 200,
    required: true,
  },
  {
    id: "REV-PAY-003",
    plan: "BASIC",
    pressureType: "feature_gate",
    featureKey: "proposalPdf",
    apiRoute: "/api/v80/proposal-pdf/render",
    limitSignal: "included=false",
    gateCode: "FEATURE_GATE",
    targetPlan: "PRO",
    ctaRef: "PRD-CNV-003",
    chargeCents: 25,
    required: true,
  },
  {
    id: "REV-PAY-004",
    plan: "BASIC",
    pressureType: "usage_cap",
    featureKey: "planGeneration",
    apiRoute: "/api/v80/tender/intake",
    limitSignal: "8/10 monthly quotes — pre-limit warning",
    gateCode: "USAGE_LIMIT",
    targetPlan: "PRO",
    ctaRef: "PRD-EXP-002",
    required: true,
  },
  {
    id: "REV-PAY-005",
    plan: "PRO",
    pressureType: "usage_cap",
    featureKey: "tenderPackage",
    apiRoute: "/api/v80/autopilot/job/run",
    limitSignal: "45/50 monthly tenders — capacity pressure",
    gateCode: "USAGE_LIMIT",
    targetPlan: "PRO",
    ctaRef: "PRD-CNV-004",
    chargeCents: 200,
    required: true,
  },
  {
    id: "REV-PAY-006",
    plan: "PRO",
    pressureType: "usage_cap",
    featureKey: "budgetGeneration",
    apiRoute: "/api/v80/budget/calculate",
    limitSignal: "50/mo cap — overage or ENTERPRISE",
    gateCode: "USAGE_LIMIT",
    targetPlan: "ENTERPRISE",
    ctaRef: "PRD-EXP-003",
    chargeCents: 50,
    required: true,
  },
  {
    id: "REV-PAY-007",
    plan: "PRO",
    pressureType: "enterprise_trigger",
    featureKey: "proposalPdf",
    apiRoute: "/api/v80/pdf?artifactId",
    limitSignal: "bundle download — multi-site buyer",
    gateCode: "FEATURE_GATE",
    targetPlan: "ENTERPRISE",
    ctaRef: "PRD-CNV-006",
    required: true,
  },
  {
    id: "REV-PAY-008",
    plan: "PRO",
    pressureType: "enterprise_trigger",
    featureKey: "planGeneration",
    apiRoute: "/api/v80/production/integrity",
    limitSignal: "governance dashboard — procurement compliance",
    gateCode: "FEATURE_GATE",
    targetPlan: "ENTERPRISE",
    ctaRef: "PRD-CNV-007",
    required: true,
  },
];

export function isPricingPressureComplete(): boolean {
  const basicTier = PRODUCT_PRICING_TIERS.find((p) => p.plan === "BASIC");
  const proTier = PRODUCT_PRICING_TIERS.find((p) => p.plan === "PRO");
  const billingFeatures = new Set(BILLING_FEATURE_GATING_MATRIX.map((b) => b.featureKey));
  const pressureTypes = new Set(PRICING_PRESSURE_POINTS.map((p) => p.pressureType));

  return (
    PRICING_PRESSURE_POINTS.length === 8 &&
    pressureTypes.has("feature_gate") &&
    pressureTypes.has("usage_cap") &&
    pressureTypes.has("enterprise_trigger") &&
    PRICING_PRESSURE_POINTS.filter((p) => p.plan === "BASIC").length >= 4 &&
    PRICING_PRESSURE_POINTS.filter((p) => p.plan === "PRO").length >= 4 &&
    PRICING_PRESSURE_POINTS.every((p) => billingFeatures.has(p.featureKey) || p.featureKey === "planGeneration") &&
    Boolean(basicTier?.features.some((f) => f.key === "budgetGeneration" && !f.included)) &&
    Boolean(proTier?.features.some((f) => f.key === "tenderPackage" && f.limit === "50/mo"))
  );
}
