import {
  SAAS_PRODUCT_API_P1_TAG,
  SAAS_PRODUCT_API_P2_TAG,
  SAAS_PRODUCT_API_P3_TAG,
  SAAS_PRODUCT_API_P4_TAG,
  SAAS_PRODUCT_API_P5_TAG,
  SAAS_PRODUCT_API_P6_TAG,
  SAAS_PRODUCT_API_P7_TAG,
  SAAS_PRODUCT_API_P8_TAG,
  SAAS_PRODUCT_API_FINAL_TAG,
  SAAS_PRODUCT_API_VERSION,
  V50_PERSISTENCE_DEPENDENCY_TAG,
} from "../shared/api-constants";

export { SAAS_PRODUCT_API_FINAL_TAG } from "../shared/api-constants";

export const V51_API_PHASE_TAGS = [
  SAAS_PRODUCT_API_P1_TAG,
  SAAS_PRODUCT_API_P2_TAG,
  SAAS_PRODUCT_API_P3_TAG,
  SAAS_PRODUCT_API_P4_TAG,
  SAAS_PRODUCT_API_P5_TAG,
  SAAS_PRODUCT_API_P6_TAG,
  SAAS_PRODUCT_API_P7_TAG,
  SAAS_PRODUCT_API_FINAL_TAG,
] as const;

export const V51_API_LAYER_STACK = [
  { phase: "P1", name: "API Shell Foundation", tag: SAAS_PRODUCT_API_P1_TAG },
  { phase: "P2", name: "Tenant & Adapter Wiring", tag: SAAS_PRODUCT_API_P2_TAG },
  { phase: "P3", name: "Workspace API", tag: SAAS_PRODUCT_API_P3_TAG },
  { phase: "P4", name: "Quote API", tag: SAAS_PRODUCT_API_P4_TAG },
  { phase: "P5", name: "Workflow API", tag: SAAS_PRODUCT_API_P5_TAG },
  { phase: "P6", name: "Audit Read API", tag: SAAS_PRODUCT_API_P6_TAG },
  { phase: "P7", name: "Audit Sweep", tag: SAAS_PRODUCT_API_P7_TAG },
  { phase: "P8", name: "API Exposure Final Freeze", tag: SAAS_PRODUCT_API_FINAL_TAG },
] as const;

export const V51_API_ROUTE_MAP = [
  { path: "/api/saas-product/health", methods: ["GET"], phase: "P1", requireTenant: false },
  { path: "/api/saas-product/me", methods: ["GET"], phase: "P2", requireTenant: true },
  { path: "/api/saas-product/workspaces", methods: ["GET", "POST"], phase: "P3", requireTenant: true },
  { path: "/api/saas-product/workspaces/:workspaceId", methods: ["GET", "PATCH"], phase: "P3", requireTenant: true },
  {
    path: "/api/saas-product/workspaces/:workspaceId/quotes",
    methods: ["GET", "POST"],
    phase: "P4",
    requireTenant: true,
  },
  { path: "/api/saas-product/quotes/:quoteId", methods: ["GET", "PATCH"], phase: "P4", requireTenant: true },
  { path: "/api/saas-product/quotes/:quoteId/workflow", methods: ["GET"], phase: "P5", requireTenant: true },
  { path: "/api/saas-product/workflows", methods: ["GET"], phase: "P5", requireTenant: true },
  {
    path: "/api/saas-product/workflows/:workflowId/transition",
    methods: ["POST"],
    phase: "P5",
    requireTenant: true,
  },
  { path: "/api/saas-product/workflows/:workflowId/history", methods: ["GET"], phase: "P6", requireTenant: true },
  { path: "/api/saas-product/workflows/:workflowId/events", methods: ["GET"], phase: "P6", requireTenant: true },
] as const;

export const V51_FROZEN_HANDLERS = [
  { name: "handleHealth", layer: "P1", frozen: true },
  { name: "handleMe", layer: "P2", frozen: true },
  { name: "handleCreateWorkspace", layer: "P3", frozen: true },
  { name: "handleListWorkspaces", layer: "P3", frozen: true },
  { name: "handleGetWorkspace", layer: "P3", frozen: true },
  { name: "handleUpdateWorkspaceStatus", layer: "P3", frozen: true },
  { name: "handleCreateQuote", layer: "P4", frozen: true },
  { name: "handleListQuotes", layer: "P4", frozen: true },
  { name: "handleGetQuote", layer: "P4", frozen: true },
  { name: "handleUpdateQuote", layer: "P4", frozen: true },
  { name: "handleGetWorkflow", layer: "P5", frozen: true },
  { name: "handleListWorkflows", layer: "P5", frozen: true },
  { name: "handleTransitionWorkflow", layer: "P5", frozen: true },
  { name: "handleListWorkflowHistory", layer: "P6", frozen: true },
  { name: "handleListWorkflowEvents", layer: "P6", frozen: true },
] as const;

export const V51_LAYER_BOUNDARIES = {
  v38_v48: "frozen — tenant context via resolveTenantContext only",
  v49: "frozen — no route/handler imports from lib/saas-product",
  v50: "frozen — persistence via adapter/runtime only, no route prisma",
  v51_api: "frozen — P1~P7 routes/handlers + P8 meta lock",
  routes: "thin shell (<15 lines), withApiContext required",
  tenant: "ctx.tenantId only — body/query tenantId ignored",
  ui: "no V51 UI — deferred to V52 Portal UI",
} as const;

export const V51_RUNTIME_MAPPING = {
  workspace: "ctx.runtime.workspace.*",
  quoteWorkflow: "ctx.runtime.quoteWorkflow.create | list | transition",
  quoteCrud: "getQuotePersistenceAccess → persistenceRepositories.quote (prisma) or memory store",
  workflowRead: "getWorkflowPersistenceAccess → persistenceRepositories.workflow.findByQuoteId",
  auditRead: "getAuditPersistenceAccess → workflowHistory / workflowEvent listByWorkflowId",
  tenant: "resolveApiTenant → V48 resolveTenantContext",
} as const;

export const V51_AUDIT_CHECKS = [
  "ROUTE_BOUNDARY_PASS",
  "THIN_ROUTE_PASS",
  "TENANT_ENFORCEMENT_PASS",
  "READ_ONLY_PASS",
  "ENDPOINT_COVERAGE_PASS",
  "TENANT_ISOLATION_PASS",
  "REGRESSION_PASS",
] as const;

export const V51_META = {
  tag: SAAS_PRODUCT_API_FINAL_TAG,
  p8Tag: SAAS_PRODUCT_API_P8_TAG,
  version: SAAS_PRODUCT_API_VERSION,
  dependencyTag: V50_PERSISTENCE_DEPENDENCY_TAG,
  status: "frozen",
  phases: ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"],
  routeCount: 11,
  endpointCount: 15,
  tenantProtectedCount: 14,
  auditStatus: "pass",
  frozen: true,
  layerStack: V51_API_LAYER_STACK,
  routeMap: V51_API_ROUTE_MAP,
  frozenHandlers: V51_FROZEN_HANDLERS,
  layerBoundaries: V51_LAYER_BOUNDARIES,
  runtimeMapping: V51_RUNTIME_MAPPING,
  auditChecks: V51_AUDIT_CHECKS,
  phaseTags: V51_API_PHASE_TAGS,
  nextHorizon: "V52 Portal UI",
} as const;

export type V51Meta = typeof V51_META;
