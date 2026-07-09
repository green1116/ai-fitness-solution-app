/**
 * V80 APP P3 — API implementation specs (input/schema/service/response/error)
 */
import { ENGINEERING_API_SPECS } from "./engineering.api.spec";
import type { ApiImplementationSpec } from "./blueprint.types";

export const API_IMPLEMENTATION_SPECS: ApiImplementationSpec[] = [
  {
    id: "BLP-API-001",
    engineeringRef: "ENG-API-001",
    route: "/api/enterprise-saas/tenant/run",
    method: "POST",
    handlerPath: "app/api/enterprise-saas/tenant/run/route.ts",
    input: {
      source: "req.json()",
      zodSchema: "z.object({ organizationName: z.string(), plan: z.enum(['BASIC','PRO','ENTERPRISE']), adminEmail: z.string().email() })",
      required: ["organizationName", "plan", "adminEmail"],
    },
    service: {
      module: "lib/saas/tenant.service",
      function: "provisionTenant({ name, plan, adminEmail })",
      prismaTx: true,
    },
    response: {
      success: { ok: "true", organizationId: "string", workspaceId: "string" },
      statusCode: 201,
    },
    errors: [
      { code: "VALIDATION_ERROR", status: 400, when: "zod parse fail" },
      { code: "SLUG_CONFLICT", status: 409, when: "Organization.slug exists" },
    ],
    gate: "none (bootstrap)",
    required: true,
  },
  {
    id: "BLP-API-002",
    engineeringRef: "ENG-API-002",
    route: "/api/entitlements",
    method: "GET",
    handlerPath: "app/api/entitlements/route.ts",
    input: {
      source: "session via getServerSession()",
      zodSchema: "session.organizationId required",
      required: ["organizationId"],
    },
    service: {
      module: "lib/saas/entitlement.service",
      function: "resolveEntitlements(organizationId)",
      prismaTx: false,
    },
    response: {
      success: { tier: "SaasPlan", features: "FeatureMap", usage: "UsageMap" },
      statusCode: 200,
    },
    errors: [
      { code: "UNAUTHORIZED", status: 401, when: "no session" },
      { code: "NO_SUBSCRIPTION", status: 404, when: "Subscription missing" },
    ],
    gate: "session",
    required: true,
  },
  {
    id: "BLP-API-003",
    engineeringRef: "ENG-API-003",
    route: "/api/budget/calculate",
    method: "POST",
    handlerPath: "app/api/budget/calculate/route.ts",
    input: {
      source: "req.json()",
      zodSchema: "z.object({ quoteId: z.string(), companySize: z.number().positive(), budgetTier: z.enum(['low','mid','high']) })",
      required: ["quoteId", "companySize", "budgetTier"],
    },
    service: {
      module: "lib/services/budget.service",
      function: "calculateBudget({ quoteId, companySize, budgetTier, organizationId })",
      prismaTx: true,
    },
    response: {
      success: { ok: "true", budgetId: "string", totals: "BudgetTotals" },
      statusCode: 200,
    },
    errors: [
      { code: "FEATURE_GATE", status: 403, when: "canGenerateBudget denied" },
      { code: "QUOTE_NOT_FOUND", status: 404, when: "Quote.id missing" },
    ],
    gate: "runSaasApiGate(req, 'canGenerateBudget')",
    required: true,
  },
  {
    id: "BLP-API-004",
    engineeringRef: "ENG-API-004",
    route: "/api/autopilot/job/run",
    method: "POST",
    handlerPath: "app/api/autopilot/job/run/route.ts",
    input: {
      source: "req.json()",
      zodSchema: "z.object({ projectId: z.string(), workflowKey: z.literal('tender-pack-complete'), deploymentId: z.string().optional() })",
      required: ["projectId", "workflowKey"],
    },
    service: {
      module: "lib/autopilot/workflow/runner.blueprint",
      function: "enqueueWorkflowJob({ projectId, workflowKey })",
      prismaTx: true,
    },
    response: {
      success: { ok: "true", jobId: "string", steps: "WorkflowStepBlueprint[]" },
      statusCode: 202,
    },
    errors: [
      { code: "FEATURE_GATE", status: 403, when: "tenderPackage denied" },
      { code: "PROJECT_NOT_FOUND", status: 404, when: "Project.id missing" },
    ],
    gate: "runSaasApiGate(req, 'canGenerateTenderPackage')",
    required: true,
  },
  {
    id: "BLP-API-005",
    engineeringRef: "ENG-API-005",
    route: "/api/tender/intake",
    method: "POST",
    handlerPath: "app/api/tender/intake/route.ts",
    input: {
      source: "FormData | req.json()",
      zodSchema: "z.object({ projectId: z.string(), tenderType: z.literal('enterprise-gym'), documentUrls: z.array(z.string()).optional() })",
      required: ["projectId", "tenderType"],
    },
    service: {
      module: "lib/tender/intake.service",
      function: "createTenderFromIntake({ projectId, files, tenderType })",
      prismaTx: true,
    },
    response: {
      success: { ok: "true", tenderId: "string", status: "draft" },
      statusCode: 201,
    },
    errors: [
      { code: "FEATURE_GATE", status: 403, when: "planGeneration denied" },
      { code: "UPLOAD_FAIL", status: 422, when: "file storage error" },
    ],
    gate: "runSaasApiGate(req, 'canGenerateQuote')",
    required: true,
  },
  {
    id: "BLP-API-006",
    engineeringRef: "ENG-API-006",
    route: "/api/production/integrity",
    method: "GET",
    handlerPath: "app/api/production/integrity/route.ts",
    input: {
      source: "searchParams",
      zodSchema: "z.object({ deploymentId: z.string().optional() })",
      required: [],
    },
    service: {
      module: "lib/app/v80/engineering.decomposition.entry",
      function: "runEngineeringDecomposition({ deploymentId }) — read-only spec check",
      prismaTx: false,
    },
    response: {
      success: { ok: "true", drift: "object", consistency: "object" },
      statusCode: 200,
    },
    errors: [{ code: "UNAUTHORIZED", status: 401, when: "enterprise admin only" }],
    gate: "enterpriseAdmin",
    required: true,
  },
  {
    id: "BLP-API-007",
    engineeringRef: "ENG-API-007",
    route: "/api/proposal-pdf/render",
    method: "POST",
    handlerPath: "app/api/proposal-pdf/render/route.ts",
    input: {
      source: "req.json()",
      zodSchema: "z.object({ projectId: z.string(), sections: z.array(ProposalSectionSchema), branding: BrandConfigSchema.optional() })",
      required: ["projectId", "sections"],
    },
    service: {
      module: "lib/pdf/proposal/assembly",
      function: "renderProposalPdfBuffer(input) → DocumentExport.create",
      prismaTx: true,
    },
    response: {
      success: { ok: "true", artifactId: "string", downloadUrl: "string" },
      statusCode: 200,
    },
    errors: [
      { code: "FEATURE_GATE", status: 403, when: "proposalPdf denied" },
      { code: "RENDER_FAIL", status: 500, when: "pdf-lib error" },
    ],
    gate: "runSaasApiGate(req, 'canExportProposalPdf')",
    required: true,
  },
  {
    id: "BLP-API-008",
    engineeringRef: "ENG-API-008",
    route: "/api/pdf",
    method: "GET",
    handlerPath: "app/api/pdf/route.ts",
    input: {
      source: "searchParams",
      zodSchema: "z.object({ type: z.enum(['budget','plan']), projectId: z.string(), budgetId: z.string().optional(), level: z.enum(['brand','government']).default('brand') })",
      required: ["type", "projectId"],
    },
    service: {
      module: "lib/pdf/renderBudgetPdf.ts | lib/pdf/tender/plan",
      function: "renderBudgetPdfBuffer() | renderPlanPdfBuffer()",
      prismaTx: true,
    },
    response: {
      success: { contentType: "application/pdf", body: "Uint8Array stream" },
      statusCode: 200,
    },
    errors: [
      { code: "FEATURE_GATE", status: 403, when: "budget/plan entitlement denied" },
      { code: "NOT_FOUND", status: 404, when: "Budget/Project missing" },
    ],
    gate: "runSaasApiGate by type",
    required: true,
  },
];

export function isApiImplementationSpecComplete(): boolean {
  const engRefs = new Set(ENGINEERING_API_SPECS.map((s) => s.id));
  return (
    API_IMPLEMENTATION_SPECS.length === 8 &&
    API_IMPLEMENTATION_SPECS.every(
      (s) =>
        engRefs.has(s.engineeringRef) &&
        s.service.module.length > 0 &&
        s.errors.length >= 1,
    )
  );
}

export function getApiImplementationByRoute(route: string): ApiImplementationSpec | undefined {
  return API_IMPLEMENTATION_SPECS.find((s) => s.route === route);
}
