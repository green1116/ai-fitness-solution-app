import {
  WORKSPACE_QUOTE_PRODUCT_P1_TAG,
  WORKSPACE_QUOTE_PRODUCT_P2_TAG,
  WORKSPACE_QUOTE_PRODUCT_P3_TAG,
  WORKSPACE_QUOTE_PRODUCT_P4_TAG,
  WORKSPACE_QUOTE_PRODUCT_P5_TAG,
  WORKSPACE_QUOTE_PRODUCT_P6_TAG,
  WORKSPACE_QUOTE_PRODUCT_P7_TAG,
  WORKSPACE_QUOTE_PRODUCT_P8_TAG,
  WORKSPACE_QUOTE_PRODUCT_FINAL_TAG,
  WORKSPACE_QUOTE_PRODUCT_FINAL_VERSION,
  WORKSPACE_QUOTE_PRODUCT_VERSION,
  WORKSPACE_QUOTE_INTEGRATION_FINAL_DEPENDENCY_TAG,
  QUOTE_UI_LOADING_EXECUTING,
  QUOTE_UI_LOADING_IDLE,
  QUOTE_UI_LOADING_LOADING,
  QUOTE_UI_LOADING_SUBMITTING,
  QUOTE_UI_READINESS_BLOCKED,
  QUOTE_UI_READINESS_PARTIAL,
  QUOTE_UI_READINESS_READY,
  QUOTE_UI_STATUS_DONE,
  QUOTE_UI_STATUS_DRAFT,
  QUOTE_UI_STATUS_EMPTY,
  QUOTE_UI_STATUS_FAILED,
  QUOTE_UI_STATUS_RUNNING,
} from "../shared/quote-product-constants";
import { QUOTE_PRODUCT_PORTAL_PAGE_BINDING } from "../portal/quote-product-route";
import { QUOTE_WORKSPACE_PORTAL_ROUTE_PATTERN } from "../workspace/quote-workspace.route";

export const V57_PRODUCT_FROZEN = "V57_PRODUCT_FROZEN" as const;

export const V57_QUOTE_PRODUCT_PHASE_TAGS = [
  WORKSPACE_QUOTE_PRODUCT_P1_TAG,
  WORKSPACE_QUOTE_PRODUCT_P2_TAG,
  WORKSPACE_QUOTE_PRODUCT_P3_TAG,
  WORKSPACE_QUOTE_PRODUCT_P4_TAG,
  WORKSPACE_QUOTE_PRODUCT_P5_TAG,
  WORKSPACE_QUOTE_PRODUCT_P6_TAG,
  WORKSPACE_QUOTE_PRODUCT_P7_TAG,
  WORKSPACE_QUOTE_PRODUCT_P8_TAG,
] as const;

export const V57_QUOTE_PRODUCT_LAYER_STACK = [
  { phase: "P1", name: "Quote Workspace Bootstrap UI", tag: WORKSPACE_QUOTE_PRODUCT_P1_TAG, status: "quote-workspace-bootstrap-ui" },
  { phase: "P2", name: "Quote Entry Layer", tag: WORKSPACE_QUOTE_PRODUCT_P2_TAG, status: "quote-entry-layer" },
  { phase: "P3", name: "Quote Product Service Layer", tag: WORKSPACE_QUOTE_PRODUCT_P3_TAG, status: "quote-product-service-layer" },
  { phase: "P4", name: "Quote Execution Client Layer", tag: WORKSPACE_QUOTE_PRODUCT_P4_TAG, status: "quote-execution-client-layer" },
  { phase: "P5", name: "Quote UI State Mapping", tag: WORKSPACE_QUOTE_PRODUCT_P5_TAG, status: "quote-ui-state-mapping" },
  { phase: "P6", name: "Quote Product Surface Assembly", tag: WORKSPACE_QUOTE_PRODUCT_P6_TAG, status: "quote-product-surface-assembly" },
  { phase: "P7", name: "Portal Wiring Final", tag: WORKSPACE_QUOTE_PRODUCT_P7_TAG, status: "portal-wiring-final" },
  { phase: "P8", name: "Full Portal Verification", tag: WORKSPACE_QUOTE_PRODUCT_P8_TAG, status: "full-portal-verification" },
] as const;

export const V57_QUOTE_PRODUCT_ARCHITECTURE_SNAPSHOT = {
  productVersion: WORKSPACE_QUOTE_PRODUCT_VERSION,
  finalVersion: WORKSPACE_QUOTE_PRODUCT_FINAL_VERSION,
  portalEntry: QUOTE_WORKSPACE_PORTAL_ROUTE_PATTERN,
  uiSourceOfTruth: "QuoteProductSurface",
  loaderChain: [
    QUOTE_PRODUCT_PORTAL_PAGE_BINDING.loader,
    QUOTE_PRODUCT_PORTAL_PAGE_BINDING.surfaceLoader,
    "hydrateQuoteProductSurface",
  ],
  runtimeDependency: WORKSPACE_QUOTE_INTEGRATION_FINAL_DEPENDENCY_TAG,
  layers: V57_QUOTE_PRODUCT_LAYER_STACK.length,
} as const;

export const V57_QUOTE_PRODUCT_SURFACE_CONTRACT = {
  requiredFields: ["workspaceId", "state", "viewModel", "entry", "workspace", "portalRoute", "title"],
  actions: ["submit", "refresh"],
  sourceOfTruth: QUOTE_PRODUCT_PORTAL_PAGE_BINDING.sourceOfTruth,
} as const;

export const V57_QUOTE_PRODUCT_EXECUTION_CHAIN = [
  "Portal UI",
  "QuoteProductSurface",
  "UI State Layer",
  "Entry Layer",
  "Product Service",
  "Execution Client",
  "Runtime Client",
  "V56 Runtime Integration",
] as const;

export const V57_QUOTE_PRODUCT_UI_STATE_MODEL = {
  quoteStatus: [
    QUOTE_UI_STATUS_EMPTY,
    QUOTE_UI_STATUS_DRAFT,
    QUOTE_UI_STATUS_RUNNING,
    QUOTE_UI_STATUS_DONE,
    QUOTE_UI_STATUS_FAILED,
  ],
  readiness: [QUOTE_UI_READINESS_READY, QUOTE_UI_READINESS_PARTIAL, QUOTE_UI_READINESS_BLOCKED],
  loading: [
    QUOTE_UI_LOADING_IDLE,
    QUOTE_UI_LOADING_LOADING,
    QUOTE_UI_LOADING_SUBMITTING,
    QUOTE_UI_LOADING_EXECUTING,
  ],
} as const;

export const V57_QUOTE_PRODUCT_ENTRY_FLOW = {
  create: "createQuoteEntry",
  submit: "submitQuoteProductSurfaceAction",
  refresh: "refreshQuoteProductSurfaceAction",
  mapToUiState: "mapExecutionResultToUIState",
  portalBinding: QUOTE_PRODUCT_PORTAL_PAGE_BINDING,
} as const;

export const V57_QUOTE_PRODUCT_RUNTIME_BOUNDARY_RULES = {
  v53: "frozen — no modifications",
  v54: "frozen — no modifications",
  v55: "frozen — no modifications",
  v56: "frozen — accessed only via quote-runtime.client public API",
  prisma: "forbidden in product surface layers",
  repository: "forbidden in product surface layers",
  directRuntimeImport: "forbidden outside integration/quote-runtime.client.ts",
  uiBypass: "forbidden — portal must consume QuoteProductSurface only",
  legacyPortalLoaders: "forbidden in app routes — QuoteEntryPortalPageLoader retired from portal wiring",
  newProductLayers: "forbidden after V57 final — product surface baseline locked",
} as const;

export const V57_QUOTE_PRODUCT_FINAL_VERIFY_CHECKS = [
  "V57_PRODUCT_FROZEN",
  "V57_PRODUCT_LOCKED",
  "ALL_PHASES_PASS",
  "HAS_SINGLE_PORTAL_ENTRY",
  "HAS_SURFACE_ONLY_RENDERING",
  "NO_LEGACY_ENTRY_ROUTE",
  "NO_DIRECT_RUNTIME_ACCESS",
  "HAS_LOADER_HYDRATION",
  "HAS_FINAL_FREEZE_FILE",
] as const;

export const WORKSPACE_QUOTE_PRODUCT_FINAL_FREEZE = {
  tag: WORKSPACE_QUOTE_PRODUCT_FINAL_TAG,
  version: WORKSPACE_QUOTE_PRODUCT_FINAL_VERSION,
  productVersion: WORKSPACE_QUOTE_PRODUCT_VERSION,
  status: "frozen",
  state: "FROZEN" as const,
  frozen: true,
  layers: V57_QUOTE_PRODUCT_LAYER_STACK.length,
  productFrozen: V57_PRODUCT_FROZEN,
  dependencyTag: WORKSPACE_QUOTE_PRODUCT_P8_TAG,
  upstreamDependencyTag: WORKSPACE_QUOTE_INTEGRATION_FINAL_DEPENDENCY_TAG,
  phaseTags: V57_QUOTE_PRODUCT_PHASE_TAGS,
  layerStack: V57_QUOTE_PRODUCT_LAYER_STACK,
  architectureSnapshot: V57_QUOTE_PRODUCT_ARCHITECTURE_SNAPSHOT,
  surfaceContract: V57_QUOTE_PRODUCT_SURFACE_CONTRACT,
  executionChain: V57_QUOTE_PRODUCT_EXECUTION_CHAIN,
  uiStateModel: V57_QUOTE_PRODUCT_UI_STATE_MODEL,
  entryFlow: V57_QUOTE_PRODUCT_ENTRY_FLOW,
  runtimeBoundaryRules: V57_QUOTE_PRODUCT_RUNTIME_BOUNDARY_RULES,
  verifyChecks: V57_QUOTE_PRODUCT_FINAL_VERIFY_CHECKS,
  nextHorizon: "Production rollout / commercial expansion (not started)",
  note: "V57 quote product surface final — P1 through P8 product stack locked",
} as const;

export type V57QuoteProductFinalFreeze = typeof WORKSPACE_QUOTE_PRODUCT_FINAL_FREEZE;
