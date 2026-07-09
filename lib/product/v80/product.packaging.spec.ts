/**
 * V80 PRODUCT P1 — SaaS packaging (tiers + positioning + modules)
 */
import { PRODUCT_MODULE_MAP } from "@/lib/app/v80/product.module.map";
import type { ProductModulePack, ProductPackagingTier } from "./productization.types";

export const PRODUCT_PACKAGING_TIERS: ProductPackagingTier[] = [
  {
    id: "PRD-PKG-001",
    plan: "BASIC",
    marketName: "FitStart",
    tagline: "From RFP to floor plan — fast",
    positioning: "Solo gym consultants & small operators — plan PDF + tender intake",
    buyerPersona: "Independent fitness consultant, 1–3 projects/mo",
    modules: ["workspace", "tender-intake", "plan-pdf", "entitlements"],
    codeReleaseRef: "v80-code-release-1",
    required: true,
  },
  {
    id: "PRD-PKG-002",
    plan: "PRO",
    marketName: "FitScale",
    tagline: "Full tender response in one workflow",
    positioning: "Regional integrators — budget + proposal + autopilot tender pack",
    buyerPersona: "Equipment reseller / design-build firm, 5–20 tenders/mo",
    modules: [
      "workspace",
      "tender-intake",
      "budget-engine",
      "autopilot-workflow",
      "proposal-pdf",
      "plan-pdf",
      "budget-pdf",
    ],
    codeReleaseRef: "v80-code-release-1",
    required: true,
  },
  {
    id: "PRD-PKG-003",
    plan: "ENTERPRISE",
    marketName: "FitEnterprise",
    tagline: "Governed tender operations at scale",
    positioning: "National chains & enterprise procurement — bundle + integrity + audit",
    buyerPersona: "Enterprise gym operator, procurement team, compliance requirements",
    modules: [
      "workspace",
      "tender-intake",
      "budget-engine",
      "autopilot-workflow",
      "proposal-pdf",
      "enterprise-bundle",
      "integrity-governance",
      "ops-dashboard",
    ],
    codeReleaseRef: "v80-code-release-1",
    required: true,
  },
];

export const PRODUCT_MODULE_PACKS: ProductModulePack[] = [
  {
    id: "PRD-MOD-001",
    moduleKey: "workspace",
    displayName: "Operator Workspace",
    userValue: "Multi-tenant gym operator account & project hub",
    apiSurfaces: ["/api/v80/tenant/run", "/api/v80/entitlements"],
    pdfOutputs: [],
    tiers: ["BASIC", "PRO", "ENTERPRISE"],
    appModuleRef: "APP-MOD-001",
    required: true,
  },
  {
    id: "PRD-MOD-002",
    moduleKey: "tender-intake",
    displayName: "Tender Intake",
    userValue: "Upload enterprise gym RFP → structured tender project",
    apiSurfaces: ["/api/v80/tender/intake"],
    pdfOutputs: [],
    tiers: ["BASIC", "PRO", "ENTERPRISE"],
    appModuleRef: "APP-MOD-003",
    required: true,
  },
  {
    id: "PRD-MOD-003",
    moduleKey: "budget-engine",
    displayName: "Equipment Budget",
    userValue: "Company-size budget calc → brand/government PDF",
    apiSurfaces: ["/api/v80/budget/calculate", "/api/v80/pdf?type=budget"],
    pdfOutputs: ["budget-pdf"],
    tiers: ["PRO", "ENTERPRISE"],
    appModuleRef: "APP-MOD-006",
    required: true,
  },
  {
    id: "PRD-MOD-004",
    moduleKey: "autopilot-workflow",
    displayName: "Tender Autopilot",
    userValue: "One-click tender-pack-complete DAG (8 steps)",
    apiSurfaces: ["/api/v80/autopilot/job/run"],
    pdfOutputs: ["plan-pdf", "budget-pdf", "proposal-pdf", "bundle"],
    tiers: ["PRO", "ENTERPRISE"],
    appModuleRef: "APP-MOD-003",
    required: true,
  },
  {
    id: "PRD-MOD-005",
    moduleKey: "proposal-pdf",
    displayName: "Proposal Builder",
    userValue: "Branded proposal PDF from sections",
    apiSurfaces: ["/api/v80/proposal-pdf/render"],
    pdfOutputs: ["proposal-pdf"],
    tiers: ["PRO", "ENTERPRISE"],
    appModuleRef: "APP-MOD-006",
    required: true,
  },
  {
    id: "PRD-MOD-006",
    moduleKey: "plan-pdf",
    displayName: "Floor Plan PDF",
    userValue: "Fitness layout plan deliverable",
    apiSurfaces: ["/api/v80/pdf?type=plan"],
    pdfOutputs: ["plan-pdf"],
    tiers: ["BASIC", "PRO", "ENTERPRISE"],
    appModuleRef: "APP-MOD-006",
    required: true,
  },
  {
    id: "PRD-MOD-007",
    moduleKey: "enterprise-bundle",
    displayName: "Response Pack",
    userValue: "Merged enterprise zip — plan + budget + proposal",
    apiSurfaces: ["/api/v80/autopilot/job/run"],
    pdfOutputs: ["bundle"],
    tiers: ["ENTERPRISE"],
    appModuleRef: "APP-WFL-006",
    required: true,
  },
  {
    id: "PRD-MOD-008",
    moduleKey: "integrity-governance",
    displayName: "Governance & Integrity",
    userValue: "Production integrity + audit trail for compliance",
    apiSurfaces: ["/api/v80/production/integrity", "/api/v80/ops/governance/audit"],
    pdfOutputs: [],
    tiers: ["ENTERPRISE"],
    appModuleRef: "APP-MOD-004",
    required: true,
  },
];

export function isProductPackagingComplete(): boolean {
  const plans = new Set(PRODUCT_PACKAGING_TIERS.map((p) => p.plan));
  const appModules = new Set(PRODUCT_MODULE_MAP.map((m) => m.id));
  return (
    PRODUCT_PACKAGING_TIERS.length === 3 &&
    PRODUCT_MODULE_PACKS.length === 8 &&
    plans.has("BASIC") &&
    plans.has("PRO") &&
    plans.has("ENTERPRISE") &&
    PRODUCT_MODULE_PACKS.every((m) => appModules.has(m.appModuleRef) || m.appModuleRef.startsWith("APP-WFL"))
  );
}

export function getPackagingByPlan(plan: ProductPackagingTier["plan"]) {
  return PRODUCT_PACKAGING_TIERS.find((p) => p.plan === plan);
}
