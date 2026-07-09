/**
 * V80 POST-LAUNCH P2 — Pricing yield optimization (ARPA + upgrade timing + usage pressure)
 * Tunes P1 PRICING_PRESSURE_POINTS + PRODUCT P1 tiers + mapUsageToCharge
 */
import { PRODUCT_PRICING_TIERS } from "@/lib/product/v80/product.pricing.spec";
import { PRICING_PRESSURE_POINTS } from "./revenue.pricing-pressure.spec";
import type { PricingYieldOptimization } from "./optimization.types";

export const PRICING_YIELD_OPTIMIZATION: PricingYieldOptimization[] = [
  {
    id: "REV-OPT-YLD-001",
    metric: "arpa",
    plan: "PRO",
    signal: "Base $299/mo + metered usage",
    apiRoute: "/api/v80/budget/calculate",
    optimization: "Surface cumulative usage charges in entitlements response — ARPA visibility drives expansion",
    yieldImpact: "+$45–$120/mo ARPA from BUDGET+TENDER+PDF metered",
    required: true,
  },
  {
    id: "REV-OPT-YLD-002",
    metric: "arpa",
    plan: "PRO",
    signal: "TENDER ¢200 highest unit yield",
    apiRoute: "/api/v80/autopilot/job/run",
    optimization: "Prioritize autopilot upsell after 3rd budget calc — cross-sell highest-yield usage type",
    yieldImpact: "+$40/mo avg from TENDER cross-sell",
    required: true,
  },
  {
    id: "REV-OPT-YLD-003",
    metric: "upgrade_timing",
    plan: "BASIC",
    signal: "7/10 quotes — proactive vs 8/10 reactive",
    apiRoute: "/api/v80/tender/intake",
    p1PressureRef: "REV-PAY-004",
    optimization: "Early warning at 70% quote cap — upgrade CTA before USAGE_LIMIT hard block",
    yieldImpact: "+22% BASIC→PRO conversion vs limit-hit only",
    required: true,
  },
  {
    id: "REV-OPT-YLD-004",
    metric: "upgrade_timing",
    plan: "BASIC",
    signal: "First FEATURE_GATE on budget — same-session checkout",
    apiRoute: "/api/v80/budget/calculate",
    p1PressureRef: "REV-PAY-001",
    optimization: "Gate response includes FitScale price anchor ($299) + annual save — reduce decision delay",
    yieldImpact: "+18% gate→paid within 24h",
    required: true,
  },
  {
    id: "REV-OPT-YLD-005",
    metric: "usage_pressure",
    plan: "PRO",
    signal: "40/50 tenders — soft nudge vs 45/50 hard warning",
    apiRoute: "/api/v80/autopilot/job/run",
    p1PressureRef: "REV-PAY-005",
    optimization: "Capacity banner at 80% tender cap — add-on pack CTA before 429",
    yieldImpact: "+15% capacity upsell; −30% churn at limit",
    required: true,
  },
  {
    id: "REV-OPT-YLD-006",
    metric: "usage_pressure",
    plan: "PRO",
    signal: "45/50 budget — ENTERPRISE bridge",
    apiRoute: "/api/v80/budget/calculate",
    p1PressureRef: "REV-PAY-006",
    optimization: "Budget cap hit routes to sales-assist ENTERPRISE — not silent block",
    yieldImpact: "+$8k ACV from PRO→ENTERPRISE bridge",
    required: true,
  },
  {
    id: "REV-OPT-YLD-007",
    metric: "arpa",
    plan: "ENTERPRISE",
    signal: "Custom ACV + unlimited metered baseline",
    apiRoute: "/api/v80/pdf?artifactId",
    p1PressureRef: "REV-PAY-007",
    optimization: "Bundle download usage bundled into annual contract — reduce line-item friction",
    yieldImpact: "+12% enterprise ACV from usage-inclusive packaging",
    required: true,
  },
  {
    id: "REV-OPT-YLD-008",
    metric: "upgrade_timing",
    plan: "PRO",
    signal: "Proposal PDF post-workflow — peak willingness-to-pay",
    apiRoute: "/api/v80/proposal-pdf/render",
    p1PressureRef: "REV-PAY-003",
    optimization: "Annual upgrade offer at proposal render success — capitalize on deliverable moment",
    yieldImpact: "+10% monthly→annual conversion",
    required: true,
  },
];

export function isPricingYieldOptimizationComplete(): boolean {
  const pressureIds = new Set(PRICING_PRESSURE_POINTS.map((p) => p.id));
  const metrics = new Set(PRICING_YIELD_OPTIMIZATION.map((y) => y.metric));
  const proTier = PRODUCT_PRICING_TIERS.find((p) => p.plan === "PRO");

  return (
    PRICING_YIELD_OPTIMIZATION.length === 8 &&
    metrics.has("arpa") &&
    metrics.has("upgrade_timing") &&
    metrics.has("usage_pressure") &&
    PRICING_YIELD_OPTIMIZATION.filter((y) => y.p1PressureRef).every((y) =>
      pressureIds.has(y.p1PressureRef!),
    ) &&
    Boolean(proTier && proTier.monthlyPriceUsd === 299)
  );
}
