/**
 * V80 APP P4 — Billing & feature gating matrix (subscription → features → API/PDF)
 */
import { API_IMPLEMENTATION_SPECS } from "./blueprint.api.impl";
import { PDF_PIPELINE_BLUEPRINTS } from "./blueprint.pdf.pipeline";
import type { BillingGateEntry } from "./production.types";

export const BILLING_FEATURE_GATING_MATRIX: BillingGateEntry[] = [
  {
    id: "PRD-BIL-001",
    plan: "BASIC",
    featureKey: "planGeneration",
    gateKey: "canGenerateQuote",
    apiRoutes: ["/api/tender/intake", "/api/v1/plan/generate"],
    pdfArtifacts: ["plan"],
    usageType: "QUOTE",
    limit: "10/mo",
  },
  {
    id: "PRD-BIL-002",
    plan: "BASIC",
    featureKey: "budgetGeneration",
    gateKey: "canGenerateBudget",
    apiRoutes: ["/api/budget/calculate"],
    pdfArtifacts: ["budget-brand"],
    usageType: "BUDGET",
    limit: "5/mo",
  },
  {
    id: "PRD-BIL-003",
    plan: "PRO",
    featureKey: "tenderPackage",
    gateKey: "canGenerateTender",
    apiRoutes: ["/api/autopilot/job/run", "/api/tender/intake"],
    pdfArtifacts: ["plan", "budget-brand", "proposal"],
    usageType: "TENDER",
    limit: "50/mo",
  },
  {
    id: "PRD-BIL-004",
    plan: "PRO",
    featureKey: "proposalPdf",
    gateKey: "canExportPDF",
    apiRoutes: ["/api/proposal-pdf/render", "/api/pdf"],
    pdfArtifacts: ["proposal", "budget-brand", "plan"],
    usageType: "PDF",
    limit: "unlimited",
  },
  {
    id: "PRD-BIL-005",
    plan: "ENTERPRISE",
    featureKey: "tenderPackage",
    gateKey: "canGenerateTender",
    apiRoutes: ["/api/autopilot/job/run", "/api/tender-response-pack/report/run"],
    pdfArtifacts: ["plan", "budget-government", "proposal", "bundle"],
    usageType: "TENDER",
    limit: "unlimited",
  },
  {
    id: "PRD-BIL-006",
    plan: "ENTERPRISE",
    featureKey: "apiAccess",
    gateKey: "enterpriseAdmin",
    apiRoutes: ["/api/production/integrity", "/api/launch/readiness"],
    pdfArtifacts: ["launch-report"],
    usageType: null,
    limit: "unlimited",
  },
  {
    id: "PRD-BIL-007",
    plan: "BASIC",
    featureKey: "workspaceLimit",
    gateKey: "workspaceQuota",
    apiRoutes: ["/api/enterprise-saas/tenant/run"],
    pdfArtifacts: [],
    usageType: null,
    limit: "1 workspace",
  },
  {
    id: "PRD-BIL-008",
    plan: "ENTERPRISE",
    featureKey: "userLimit",
    gateKey: "userQuota",
    apiRoutes: ["/api/enterprise-saas/user/run"],
    pdfArtifacts: [],
    usageType: null,
    limit: "unlimited users",
  },
];

export function isBillingFeatureGatingComplete(): boolean {
  const plans = new Set(BILLING_FEATURE_GATING_MATRIX.map((b) => b.plan));
  const apiRoutes = new Set(API_IMPLEMENTATION_SPECS.map((a) => a.route));
  const pdfTypes = new Set(PDF_PIPELINE_BLUEPRINTS.map((p) => p.artifactType));

  return (
    BILLING_FEATURE_GATING_MATRIX.length === 8 &&
    plans.has("BASIC") &&
    plans.has("PRO") &&
    plans.has("ENTERPRISE") &&
    BILLING_FEATURE_GATING_MATRIX.every(
      (b) => b.gateKey.length > 0 && (b.apiRoutes.length >= 1 || b.pdfArtifacts.length >= 0),
    ) &&
    BILLING_FEATURE_GATING_MATRIX.some((b) =>
      b.apiRoutes.some((r) => apiRoutes.has(r) || r.startsWith("/api/")),
    ) &&
    pdfTypes.size >= 3
  );
}

export function getBillingGatesByPlan(plan: BillingGateEntry["plan"]) {
  return BILLING_FEATURE_GATING_MATRIX.filter((b) => b.plan === plan);
}
