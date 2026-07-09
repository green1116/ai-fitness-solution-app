/**
 * V80 POST-LAUNCH P1 — Revenue activation loop (usage → value → billing → upgrade)
 * Aligns CODE P4 V80_COMMERCIAL_ROUTES + mapUsageToCharge + PRODUCT P2 CONVERSION_TRIGGERS
 */
import { V80_COMMERCIAL_ROUTES } from "@/lib/scaffold/v80/ops/commercial";
import { PRODUCT_FEATURE_API_MAP } from "@/lib/product/v80/product.pricing.spec";
import type { RevenueLoopStage } from "./revenue.types";

export const REVENUE_ACTIVATION_LOOP: RevenueLoopStage[] = [
  {
    id: "REV-ACT-001",
    phase: "usage",
    order: 1,
    event: "Tender intake — project created",
    apiRoute: "/api/v80/tender/intake",
    usageType: "QUOTE",
    chargeCents: 0,
    gateCode: null,
    targetPlan: null,
    required: true,
  },
  {
    id: "REV-ACT-002",
    phase: "usage",
    order: 2,
    event: "Budget calculation — equipment totals generated",
    apiRoute: "/api/v80/budget/calculate",
    usageType: "BUDGET",
    chargeCents: 50,
    gateCode: "FEATURE_GATE",
    targetPlan: "PRO",
    ctaRef: "PRD-CNV-001",
    required: true,
  },
  {
    id: "REV-ACT-003",
    phase: "usage",
    order: 3,
    event: "Autopilot workflow — tender pack assembled",
    apiRoute: "/api/v80/autopilot/job/run",
    usageType: "TENDER",
    chargeCents: 200,
    gateCode: "FEATURE_GATE",
    targetPlan: "PRO",
    ctaRef: "PRD-CNV-002",
    required: true,
  },
  {
    id: "REV-ACT-004",
    phase: "value",
    order: 4,
    event: "Plan PDF download — activation deliverable",
    apiRoute: "/api/v80/pdf?type=plan",
    usageType: "PDF",
    chargeCents: 25,
    gateCode: null,
    targetPlan: null,
    required: true,
  },
  {
    id: "REV-ACT-005",
    phase: "value",
    order: 5,
    event: "Proposal PDF render — client-ready artifact",
    apiRoute: "/api/v80/proposal-pdf/render",
    usageType: "PDF",
    chargeCents: 25,
    gateCode: "FEATURE_GATE",
    targetPlan: "PRO",
    ctaRef: "PRD-CNV-003",
    required: true,
  },
  {
    id: "REV-ACT-006",
    phase: "billing",
    order: 6,
    event: "Usage recorded — mapUsageToCharge applied",
    apiRoute: "/api/v80/budget/calculate",
    usageType: "BUDGET",
    chargeCents: 50,
    gateCode: null,
    targetPlan: null,
    required: true,
  },
  {
    id: "REV-ACT-007",
    phase: "billing",
    order: 7,
    event: "Entitlement trail — governance audit logged",
    apiRoute: "/api/v80/ops/governance/audit",
    usageType: null,
    chargeCents: null,
    gateCode: null,
    targetPlan: null,
    required: true,
  },
  {
    id: "REV-ACT-008",
    phase: "upgrade",
    order: 8,
    event: "FEATURE_GATE on blocked route — FitScale upsell",
    apiRoute: "/api/v80/budget/calculate",
    usageType: null,
    chargeCents: null,
    gateCode: "FEATURE_GATE",
    targetPlan: "PRO",
    ctaRef: "PRD-CNV-001",
    required: true,
  },
  {
    id: "REV-ACT-009",
    phase: "upgrade",
    order: 9,
    event: "USAGE_LIMIT on tender workflow — capacity upsell",
    apiRoute: "/api/v80/autopilot/job/run",
    usageType: "TENDER",
    chargeCents: 200,
    gateCode: "USAGE_LIMIT",
    targetPlan: "PRO",
    ctaRef: "PRD-CNV-004",
    required: true,
  },
  {
    id: "REV-ACT-010",
    phase: "upgrade",
    order: 10,
    event: "Enterprise bundle gate — FitEnterprise contract",
    apiRoute: "/api/v80/pdf?artifactId",
    usageType: null,
    chargeCents: null,
    gateCode: "FEATURE_GATE",
    targetPlan: "ENTERPRISE",
    ctaRef: "PRD-CNV-006",
    required: true,
  },
];

export function isRevenueLoopComplete(): boolean {
  const phases = new Set(REVENUE_ACTIVATION_LOOP.map((s) => s.phase));
  const commercialEndpoints = new Set(V80_COMMERCIAL_ROUTES.map((r) => r.endpoint));
  const featureRoutes = new Set(PRODUCT_FEATURE_API_MAP.flatMap((m) => m.routes));

  return (
    REVENUE_ACTIVATION_LOOP.length === 10 &&
    phases.has("usage") &&
    phases.has("value") &&
    phases.has("billing") &&
    phases.has("upgrade") &&
    REVENUE_ACTIVATION_LOOP.every((s, i) => s.order === i + 1) &&
    REVENUE_ACTIVATION_LOOP.filter((s) => s.phase === "usage").length >= 3 &&
    REVENUE_ACTIVATION_LOOP.filter((s) => s.ctaRef).every((s) =>
      s.ctaRef!.startsWith("PRD-CNV-"),
    ) &&
    REVENUE_ACTIVATION_LOOP.every(
      (s) => s.apiRoute.startsWith("/api/v80") && (commercialEndpoints.has(s.apiRoute.split("?")[0]!) || s.apiRoute.includes("/ops/")),
    ) &&
    [...featureRoutes].every((r) => REVENUE_ACTIVATION_LOOP.some((s) => s.apiRoute.startsWith(r)))
  );
}
