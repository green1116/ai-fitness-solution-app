/**
 * V80 PRODUCT P2 — Conversion triggers (API / workflow / PDF upgrade hooks)
 * Maps CODE P4 gate codes → upsell CTAs
 */
import type { ConversionTrigger } from "./growth.types";

export const CONVERSION_TRIGGERS: ConversionTrigger[] = [
  {
    id: "PRD-CNV-001",
    triggerType: "api",
    hook: "budget_gate",
    sourceRoute: "/api/v80/budget/calculate",
    gateCode: "FEATURE_GATE",
    targetPlan: "PRO",
    cta: "Unlock Equipment Budget — upgrade to FitScale ($299/mo)",
    upsellModule: "budget-engine",
    required: true,
  },
  {
    id: "PRD-CNV-002",
    triggerType: "api",
    hook: "autopilot_gate",
    sourceRoute: "/api/v80/autopilot/job/run",
    gateCode: "FEATURE_GATE",
    targetPlan: "PRO",
    cta: "Run full tender pack — upgrade to FitScale",
    upsellModule: "autopilot-workflow",
    required: true,
  },
  {
    id: "PRD-CNV-003",
    triggerType: "api",
    hook: "proposal_gate",
    sourceRoute: "/api/v80/proposal-pdf/render",
    gateCode: "FEATURE_GATE",
    targetPlan: "PRO",
    cta: "Export proposal PDF — upgrade to FitScale",
    upsellModule: "proposal-pdf",
    required: true,
  },
  {
    id: "PRD-CNV-004",
    triggerType: "workflow",
    hook: "tender_pack_complete",
    sourceRoute: "/api/v80/autopilot/job/run",
    gateCode: "USAGE_LIMIT",
    targetPlan: "PRO",
    cta: "Monthly tender limit reached — add capacity or upgrade",
    upsellModule: "autopilot-workflow",
    required: true,
  },
  {
    id: "PRD-CNV-005",
    triggerType: "pdf",
    hook: "budget_pdf_preview",
    sourceRoute: "/api/v80/pdf?type=budget",
    gateCode: "FEATURE_GATE",
    targetPlan: "PRO",
    cta: "Download branded budget PDF — upgrade now",
    upsellModule: "budget-engine",
    required: true,
  },
  {
    id: "PRD-CNV-006",
    triggerType: "pdf",
    hook: "bundle_download",
    sourceRoute: "/api/v80/pdf?artifactId",
    gateCode: "FEATURE_GATE",
    targetPlan: "ENTERPRISE",
    cta: "Enterprise response pack — contact sales for FitEnterprise",
    upsellModule: "enterprise-bundle",
    required: true,
  },
  {
    id: "PRD-CNV-007",
    triggerType: "api",
    hook: "integrity_gate",
    sourceRoute: "/api/v80/production/integrity",
    gateCode: "FEATURE_GATE",
    targetPlan: "ENTERPRISE",
    cta: "Governance dashboard — enterprise contract required",
    upsellModule: "integrity-governance",
    required: true,
  },
];

export function isConversionTriggersComplete(): boolean {
  const types = new Set(CONVERSION_TRIGGERS.map((t) => t.triggerType));
  return (
    CONVERSION_TRIGGERS.length === 7 &&
    types.has("api") &&
    types.has("workflow") &&
    types.has("pdf") &&
    CONVERSION_TRIGGERS.every((t) => t.sourceRoute.startsWith("/api/v80"))
  );
}

export function getTriggersByPlan(plan: ConversionTrigger["targetPlan"]) {
  return CONVERSION_TRIGGERS.filter((t) => t.targetPlan === plan);
}
