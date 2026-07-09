/**
 * V80 APP P1 — System → API surface mapping
 */
import { PRODUCT_MODULE_MAP } from "./product.module.map";
import type { ProductApiEntry } from "./product.compiler";

export const PRODUCT_API_MAP: ProductApiEntry[] = [
  {
    id: "APP-API-001",
    kernelRef: "SYS-CLS-001",
    route: "/api/enterprise-saas/tenant/run",
    method: "POST",
    saasModule: "enterprise-saas",
    entitlement: "workspaceLimit",
    prismaModels: ["Tenant", "Workspace"],
    required: true,
    description: "Tenant provisioning — gym operator onboarding",
  },
  {
    id: "APP-API-002",
    kernelRef: "SYS-CLS-002",
    route: "/api/entitlements",
    method: "GET",
    saasModule: "commercial-v64",
    entitlement: "planGeneration",
    prismaModels: ["Subscription", "PlanFeature"],
    required: true,
    description: "Entitlement resolution — tier feature gates",
  },
  {
    id: "APP-API-003",
    kernelRef: "SYS-CLS-002",
    route: "/api/budget/calculate",
    method: "POST",
    saasModule: "commercial-v64",
    entitlement: "budgetGeneration",
    prismaModels: ["BudgetRecord", "UsageLedger"],
    required: true,
    description: "Budget engine API — fitness equipment budget",
  },
  {
    id: "APP-API-004",
    kernelRef: "SYS-CLS-003",
    route: "/api/autopilot/job/run",
    method: "POST",
    saasModule: "autopilot-workflow",
    entitlement: "tenderPackage",
    prismaModels: ["AutopilotJob", "WorkflowRun"],
    required: true,
    description: "Workflow orchestration — tender→proposal pipeline",
  },
  {
    id: "APP-API-005",
    kernelRef: "SYS-CLS-003",
    route: "/api/tender/intake",
    method: "POST",
    saasModule: "autopilot-workflow",
    entitlement: "planGeneration",
    prismaModels: ["TenderProject", "TenderDocument"],
    required: true,
    description: "Tender intake — enterprise gym RFP upload",
  },
  {
    id: "APP-API-006",
    kernelRef: "SYS-CLS-004",
    route: "/api/production/integrity",
    method: "GET",
    saasModule: "production-integrity",
    entitlement: "apiAccess",
    prismaModels: ["AuditLog"],
    required: true,
    description: "Integrity dashboard — stack consistency status",
  },
  {
    id: "APP-API-007",
    kernelRef: "SYS-CLS-006",
    route: "/api/proposal-pdf/render",
    method: "POST",
    saasModule: "proposal-pdf",
    entitlement: "proposalPdf",
    prismaModels: ["DocumentArtifact"],
    required: true,
    description: "Proposal PDF render — branded tender response",
  },
  {
    id: "APP-API-008",
    kernelRef: "APP-MOD-006",
    route: "/api/pdf",
    method: "GET",
    saasModule: "budget-pdf + plan-pdf",
    entitlement: "budgetGeneration",
    prismaModels: ["BudgetRecord", "DocumentArtifact"],
    required: true,
    description: "Unified PDF gateway — budget/plan download",
  },
];

export function isProductApiMapComplete(): boolean {
  const modules = new Set(PRODUCT_MODULE_MAP.map((m) => m.saasModule.split(" + ")[0]));
  return (
    PRODUCT_API_MAP.length === 8 &&
    PRODUCT_API_MAP.every(
      (a) => a.route.startsWith("/api/") && a.prismaModels.length >= 1,
    ) &&
    modules.size >= 5
  );
}

export function getProductApiByRoute(route: string): ProductApiEntry | undefined {
  return PRODUCT_API_MAP.find((a) => a.route === route);
}
