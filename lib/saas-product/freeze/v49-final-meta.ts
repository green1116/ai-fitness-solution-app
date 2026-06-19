export const SAAS_PRODUCT_FINAL_TAG = "v49-saas-product-final" as const;
export const SAAS_PRODUCT_P8_TAG = "v49-saas-product-p8" as const;

export const V49_PHASE_TAGS = [
  "v49-saas-product-p1",
  "v49-saas-product-p2",
  "v49-saas-product-p3",
  "v49-saas-product-p4",
  "v49-saas-product-p5",
  "v49-saas-product-p6",
  "v49-saas-product-p7",
  SAAS_PRODUCT_FINAL_TAG,
] as const;

export const V49_LAYER_STACK = [
  { phase: "P1", name: "Product Registry Foundation", tag: "v49-saas-product-p1" },
  { phase: "P2", name: "Product Context Runtime", tag: "v49-saas-product-p2" },
  { phase: "P3", name: "Workspace Product Runtime", tag: "v49-saas-product-p3" },
  { phase: "P4", name: "Quote Workflow Runtime", tag: "v49-saas-product-p4" },
  { phase: "P5", name: "Delivery & Approval Workflow Runtime", tag: "v49-saas-product-p5" },
  { phase: "P6", name: "Portal Product Shell", tag: "v49-saas-product-p6" },
  { phase: "P7", name: "Product Ops Runtime", tag: "v49-saas-product-p7" },
  { phase: "P8", name: "Product Layer Freeze", tag: SAAS_PRODUCT_FINAL_TAG },
] as const;

export const V49_DEPENDENCY_GRAPH = {
  direction: "P1 → P2 → P3 → P4 → P5 → P6 → P7",
  edges: [
    { from: "P1", to: "P2", via: "resolveProduct, workflow catalog" },
    { from: "P2", to: "P3", via: "ProductContext → WorkspaceProductInstance" },
    { from: "P3", to: "P4", via: "workspaceProductId → Quote Workflow" },
    { from: "P4", to: "P5", via: "shared workflow repository + business transitions" },
    { from: "P2/P3/P4/P5", to: "P6", via: "portal read adapters" },
    { from: "P2/P3/P4/P5/P6", to: "P7", via: "ops read adapters + lifecycle status" },
  ],
  forbidden: [
    "P6/P7 → V47 runtime execution",
    "P6/P7 → workflow transition mutation",
    "P7 → bypass P3 workspace scope",
    "any layer → Prisma / DB mutation in V49",
  ],
} as const;

export const V49_FROZEN_RUNTIME_CONTRACTS = [
  { name: "resolveProduct", layer: "P1", frozen: true },
  { name: "resolveProductContext", layer: "P2", frozen: true },
  { name: "createProductWorkspace", layer: "P3", frozen: true },
  { name: "createQuoteWorkflow", layer: "P4", frozen: true },
  { name: "transitionBusinessWorkflow", layer: "P5", frozen: true },
  { name: "buildPortalView", layer: "P6", frozen: true },
  { name: "buildProductOpsRuntime", layer: "P7", frozen: true },
] as const;

export const V49_FROZEN_TYPE_CONTRACTS = [
  "ProductContext",
  "WorkspaceProductInstance",
  "WorkflowInstance",
  "PortalViewModel",
  "ProductOpsDashboard",
] as const;

export const V49_API_MAP = {
  registry: ["resolveProduct", "listProducts", "resolveWorkflowStage"],
  context: ["resolveProductContext", "bindTenantContext", "bindWorkspaceContext", "bindProductContext"],
  workspace: ["createProductWorkspace", "resolveWorkspaceProduct", "listWorkspaceProducts"],
  workflow: ["createQuoteWorkflow", "transitionWorkflow", "listWorkflowInstances"],
  businessProcess: [
    "createApprovalWorkflow",
    "createDeliveryWorkflow",
    "createReleaseWorkflow",
    "transitionBusinessWorkflow",
    "buildBusinessProcessAdapterContext",
  ],
  portal: ["resolvePortalContext", "buildPortalView", "getPortalCapabilities", "resolvePortalRoute"],
  ops: [
    "buildProductOpsRuntime",
    "buildProductOpsDashboard",
    "calculateProductHealth",
    "runHealthChecks",
    "activateProduct",
    "suspendProduct",
    "archiveProduct",
    "restoreProduct",
  ],
} as const;

export const V49_LAYER_BOUNDARIES = {
  v38_v48: "frozen — no modifications",
  v47: "catalog/mapping read-only — no runtime execution",
  v49_product_layer: "operating layer — P1~P7 runtime + P8 freeze",
  database: "no V49 schema changes",
  api_routes: "no V49 API routes",
  ui: "no V49 UI — headless runtime only",
} as const;

export const V49_META = {
  tag: SAAS_PRODUCT_FINAL_TAG,
  p8Tag: SAAS_PRODUCT_P8_TAG,
  version: "v49-saas-product-operating-layer",
  status: "frozen",
  layerStack: V49_LAYER_STACK,
  dependencyGraph: V49_DEPENDENCY_GRAPH,
  frozenRuntimeContracts: V49_FROZEN_RUNTIME_CONTRACTS,
  frozenTypeContracts: V49_FROZEN_TYPE_CONTRACTS,
  apiMap: V49_API_MAP,
  layerBoundaries: V49_LAYER_BOUNDARIES,
  phaseTags: V49_PHASE_TAGS,
  commercialSkus: ["kickstart-package", "tender-ready-package", "delivery-intelligence-package"],
  nextHorizon: "V50 Productization / Marketplace / Enterprise Scaling",
} as const;

export type V49Meta = typeof V49_META;
