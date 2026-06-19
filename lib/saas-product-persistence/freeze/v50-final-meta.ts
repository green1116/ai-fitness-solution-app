import {
  PERSISTENCE_ADAPTER_OPERATIONS,
  PERSISTENCE_AUDIT_CHECKS,
  PERSISTENCE_BACKENDS,
  PERSISTENCE_PARITY_OPERATIONS,
  PERSISTENCE_QUOTE_WORKFLOW_RUNTIME_OPERATIONS,
  PERSISTENCE_REPOSITORY_NAMES,
  PERSISTENCE_TABLES,
  PERSISTENCE_WORKSPACE_RUNTIME_OPERATIONS,
  SAAS_PRODUCT_PERSISTENCE_P1_TAG,
  SAAS_PRODUCT_PERSISTENCE_P2_TAG,
  SAAS_PRODUCT_PERSISTENCE_P3_TAG,
  SAAS_PRODUCT_PERSISTENCE_P4_TAG,
  SAAS_PRODUCT_PERSISTENCE_P5_TAG,
  SAAS_PRODUCT_PERSISTENCE_P6_TAG,
  SAAS_PRODUCT_PERSISTENCE_P7_TAG,
  SAAS_PRODUCT_PERSISTENCE_P8_TAG,
  SAAS_PRODUCT_PERSISTENCE_FINAL_TAG,
} from "../shared/persistence-constants";

export { SAAS_PRODUCT_PERSISTENCE_FINAL_TAG } from "../shared/persistence-constants";

export const V50_PERSISTENCE_PHASE_TAGS = [
  SAAS_PRODUCT_PERSISTENCE_P1_TAG,
  SAAS_PRODUCT_PERSISTENCE_P2_TAG,
  SAAS_PRODUCT_PERSISTENCE_P3_TAG,
  SAAS_PRODUCT_PERSISTENCE_P4_TAG,
  SAAS_PRODUCT_PERSISTENCE_P5_TAG,
  SAAS_PRODUCT_PERSISTENCE_P6_TAG,
  SAAS_PRODUCT_PERSISTENCE_P7_TAG,
  SAAS_PRODUCT_PERSISTENCE_FINAL_TAG,
] as const;

export const V50_PERSISTENCE_LAYER_STACK = [
  { phase: "P1", name: "Schema Foundation", tag: SAAS_PRODUCT_PERSISTENCE_P1_TAG },
  { phase: "P2", name: "Repository Foundation", tag: SAAS_PRODUCT_PERSISTENCE_P2_TAG },
  { phase: "P3", name: "Workspace Persistence Runtime", tag: SAAS_PRODUCT_PERSISTENCE_P3_TAG },
  { phase: "P4", name: "Quote Workflow Persistence", tag: SAAS_PRODUCT_PERSISTENCE_P4_TAG },
  { phase: "P5", name: "Persistence Adapter Foundation", tag: SAAS_PRODUCT_PERSISTENCE_P5_TAG },
  { phase: "P6", name: "Parity System", tag: SAAS_PRODUCT_PERSISTENCE_P6_TAG },
  { phase: "P7", name: "Audit Sweep", tag: SAAS_PRODUCT_PERSISTENCE_P7_TAG },
  { phase: "P8", name: "Production Persistence Freeze", tag: SAAS_PRODUCT_PERSISTENCE_FINAL_TAG },
] as const;

export const V50_PERSISTENCE_DEPENDENCY_GRAPH = {
  direction: "P1 → P2 → P3/P4 → P5 → P6 → P7 → P8",
  edges: [
    { from: "P1", to: "P2", via: "Prisma schema → Repository contracts" },
    { from: "P2", to: "P3", via: "WorkspaceRepository → Workspace Runtime" },
    { from: "P2", to: "P4", via: "Workflow/History/Event repositories → Quote Workflow Runtime" },
    { from: "P3/P4", to: "P5", via: "memory + prisma adapter unification" },
    { from: "P5", to: "P6", via: "backend parity validation" },
    { from: "P1~P7", to: "P7", via: "freeze-pre audit sweep" },
    { from: "P1~P7", to: "P8", via: "meta freeze + documentation lock" },
  ],
  forbidden: [
    "V50 → mutate V49 saas-product runtime",
    "V50 → mutate V48 SaaS foundation layers",
    "Runtime → direct Prisma import",
    "P1~P7 → Approval / Delivery / Release workflows",
    "P8 → API routes or UI (deferred to V51)",
  ],
} as const;

export const V50_FROZEN_RUNTIME_CONTRACTS = [
  { name: "createWorkspacePersisted", layer: "P3", frozen: true },
  { name: "resolveWorkspacePersisted", layer: "P3", frozen: true },
  { name: "createQuoteWorkflow", layer: "P4", frozen: true },
  { name: "transitionQuoteWorkflow", layer: "P4", frozen: true },
  { name: "createPersistenceRuntime", layer: "P5", frozen: true },
  { name: "resolvePersistenceBackend", layer: "P5", frozen: true },
  { name: "runMemoryPrismaParity", layer: "P6", frozen: true },
  { name: "runPersistenceAuditSweep", layer: "P7", frozen: true },
] as const;

export const V50_FROZEN_TYPE_CONTRACTS = [
  "WorkspaceRecord",
  "QuoteRecord",
  "WorkflowRecord",
  "WorkflowHistoryRecord",
  "WorkflowEventRecord",
  "PersistenceRuntime",
  "QuoteWorkflowMutationResult",
] as const;

export const V50_PERSISTENCE_API_MAP = {
  schema: [...PERSISTENCE_TABLES],
  repositories: [...PERSISTENCE_REPOSITORY_NAMES],
  workspaceRuntime: [...PERSISTENCE_WORKSPACE_RUNTIME_OPERATIONS],
  quoteWorkflowRuntime: [...PERSISTENCE_QUOTE_WORKFLOW_RUNTIME_OPERATIONS],
  adapter: [...PERSISTENCE_ADAPTER_OPERATIONS],
  parity: [...PERSISTENCE_PARITY_OPERATIONS],
  audit: [...PERSISTENCE_AUDIT_CHECKS],
  backends: [...PERSISTENCE_BACKENDS],
} as const;

export const V50_LAYER_BOUNDARIES = {
  v38_v48: "frozen — no modifications",
  v49: "frozen memory runtime — parallel to V50 persistence, no cross-import",
  v50_persistence: "frozen — P1~P7 implementation + P8 meta lock",
  database: "Prisma only inside repository layer",
  api_routes: "no V50 API routes — deferred to V51",
  ui: "no V50 UI",
} as const;

export const V50_META = {
  tag: SAAS_PRODUCT_PERSISTENCE_FINAL_TAG,
  p8Tag: SAAS_PRODUCT_PERSISTENCE_P8_TAG,
  version: "v50-production-persistence-layer",
  status: "frozen",
  layerStack: V50_PERSISTENCE_LAYER_STACK,
  dependencyGraph: V50_PERSISTENCE_DEPENDENCY_GRAPH,
  frozenRuntimeContracts: V50_FROZEN_RUNTIME_CONTRACTS,
  frozenTypeContracts: V50_FROZEN_TYPE_CONTRACTS,
  apiMap: V50_PERSISTENCE_API_MAP,
  layerBoundaries: V50_LAYER_BOUNDARIES,
  phaseTags: V50_PERSISTENCE_PHASE_TAGS,
  nextHorizon: "V51 API Exposure Layer",
} as const;

export type V50Meta = typeof V50_META;
