/**
 * V80 APP P2 — API handler specs (input/output per endpoint)
 */
import { PRODUCT_API_MAP } from "./product.api.map";
import type { ApiHandlerSpec } from "./engineering.types";

export const ENGINEERING_API_SPECS: ApiHandlerSpec[] = [
  {
    id: "ENG-API-001",
    productApiRef: "APP-API-001",
    route: "/api/enterprise-saas/tenant/run",
    method: "POST",
    handlerPath: "app/api/enterprise-saas/tenant/run/route.ts",
    inputSchema: {
      organizationName: "string",
      plan: "BASIC|PRO|ENTERPRISE",
      adminEmail: "string",
    },
    outputSchema: { ok: "boolean", organizationId: "string", workspaceId: "string" },
    prismaModels: ["Organization", "OrganizationMember"],
    required: true,
    description: "Provision gym operator tenant",
  },
  {
    id: "ENG-API-002",
    productApiRef: "APP-API-002",
    route: "/api/entitlements",
    method: "GET",
    handlerPath: "app/api/entitlements/route.ts",
    inputSchema: { organizationId: "string (session)" },
    outputSchema: {
      tier: "string",
      features: "Record<FeatureKey,boolean|number>",
      usage: "Record<UsageType,number>",
    },
    prismaModels: ["Subscription", "UsageRecord"],
    required: true,
    description: "Resolve tier entitlements",
  },
  {
    id: "ENG-API-003",
    productApiRef: "APP-API-003",
    route: "/api/budget/calculate",
    method: "POST",
    handlerPath: "app/api/budget/calculate/route.ts",
    inputSchema: {
      quoteId: "string",
      companySize: "number",
      budgetTier: "low|mid|high",
      organizationId: "string",
    },
    outputSchema: { ok: "boolean", budgetId: "string", totals: "BudgetTotals" },
    prismaModels: ["Budget", "Quote", "UsageRecord"],
    required: true,
    description: "Calculate equipment budget",
  },
  {
    id: "ENG-API-004",
    productApiRef: "APP-API-004",
    route: "/api/autopilot/job/run",
    method: "POST",
    handlerPath: "app/api/autopilot/job/run/route.ts",
    inputSchema: {
      projectId: "string",
      workflowKey: "tender-pack-complete",
      deploymentId: "string",
    },
    outputSchema: { ok: "boolean", jobId: "string", steps: "WorkflowStep[]" },
    prismaModels: ["PlanJob", "Project"],
    required: true,
    description: "Run workflow DAG job",
  },
  {
    id: "ENG-API-005",
    productApiRef: "APP-API-005",
    route: "/api/tender/intake",
    method: "POST",
    handlerPath: "app/api/tender/intake/route.ts",
    inputSchema: {
      projectId: "string",
      files: "File[]|documentUrls",
      tenderType: "enterprise-gym",
    },
    outputSchema: { ok: "boolean", tenderId: "string", status: "string" },
    prismaModels: ["Tender", "Project"],
    required: true,
    description: "Enterprise gym RFP intake",
  },
  {
    id: "ENG-API-006",
    productApiRef: "APP-API-006",
    route: "/api/production/integrity",
    method: "GET",
    handlerPath: "app/api/production/integrity/route.ts",
    inputSchema: { deploymentId: "string?" },
    outputSchema: {
      ok: "boolean",
      drift: "DriftReport",
      consistency: "ConsistencyReport",
    },
    prismaModels: ["LicenseBinding"],
    required: true,
    description: "Integrity status report",
  },
  {
    id: "ENG-API-007",
    productApiRef: "APP-API-007",
    route: "/api/proposal-pdf/render",
    method: "POST",
    handlerPath: "app/api/proposal-pdf/render/route.ts",
    inputSchema: {
      projectId: "string",
      sections: "ProposalSection[]",
      branding: "BrandConfig",
    },
    outputSchema: { ok: "boolean", artifactId: "string", downloadUrl: "string" },
    prismaModels: ["DocumentExport"],
    pdfLib: "lib/pdf/proposal/assembly → pdf-lib PDFDocument",
    required: true,
    description: "Render proposal PDF via pdf-lib",
  },
  {
    id: "ENG-API-008",
    productApiRef: "APP-API-008",
    route: "/api/pdf",
    method: "GET",
    handlerPath: "app/api/pdf/route.ts",
    inputSchema: {
      type: "budget|plan",
      budgetId: "string?",
      projectId: "string",
      level: "brand|government",
    },
    outputSchema: {
      ok: "boolean",
      contentType: "application/pdf",
      buffer: "Uint8Array",
    },
    prismaModels: ["Budget", "DocumentExport", "PdfDownloadLog"],
    pdfLib: "lib/pdf/renderBudgetPdf.ts | lib/pdf/tender/plan → pdf-lib",
    required: true,
    description: "Unified PDF gateway — budget/plan download",
  },
];

export function isEngineeringApiSpecComplete(): boolean {
  const apiRefs = new Set(PRODUCT_API_MAP.map((a) => a.id));
  return (
    ENGINEERING_API_SPECS.length === 8 &&
    ENGINEERING_API_SPECS.every(
      (s) =>
        apiRefs.has(s.productApiRef) &&
        s.handlerPath.endsWith("route.ts") &&
        Object.keys(s.inputSchema).length >= 1 &&
        Object.keys(s.outputSchema).length >= 1,
    )
  );
}

export function getEngineeringApiSpecByRoute(route: string): ApiHandlerSpec | undefined {
  return ENGINEERING_API_SPECS.find((s) => s.route === route);
}
