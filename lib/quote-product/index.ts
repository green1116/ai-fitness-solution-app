export * from "./shared/quote-product-constants";
export * from "./shared/quote-product-types";
export * from "./ui/quote-ui.model";
export * from "./ui/quote-ui.state";
export * from "./ui/quote-ui-state.mapper";
export * from "./ui/quote-ui-view.model";
export * from "./ui/quote-ui-readiness";
export * from "./ui/quote-ui-loading";
export * from "./ui/quote-ui-error";
export * from "./ui/quote-ui-surface";
export * from "./ui/quote-ui.actions";
export * from "./workspace/quote-workspace.resolver";
export * from "./workspace/quote-workspace.service";
export * from "./entry/quote-entry.controller";
export * from "./entry/quote-entry.mapper";
export * from "./entry/quote-entry.validation";
export * from "./entry/quote-entry.types";
export * from "./service/quote-product.service";
export * from "./service/quote-product.orchestrator";
export * from "./service/quote-product.types";
export * from "./service/quote-product.validation";
export * from "./service/quote-product-result.mapper";
export * from "./service/quote-product.execution";
export * from "./workspace/quote-workspace.types";
export * from "./execution/quote-execution.types";
export * from "./execution/quote-execution.validation";
export * from "./execution/quote-execution.error";
export * from "./execution/quote-execution.mapper";
export * from "./execution/quote-execution.adapter";
export * from "./execution/quote-execution.client";
export * from "./integration/quote-runtime.client";
export * from "./portal/quote-entry-portal-page";
export * from "./portal/quote-entry-portal-loader";
export {
  validateQuoteProductP1,
  assertHasProductLayer,
  assertHasWorkspaceUI,
  assertHasEntryLayer,
  assertHasProductService,
  assertHasExecutionBridge,
  assertNoDirectExecutionImport,
  assertNoPrismaAccess,
  assertNoRepositoryAccess,
  assertMountedQuoteWorkspaceBootstrap,
  assertMountedQuoteRuntimeClientBridge,
} from "./validation/validate-quote-product-p1";
export type { QuoteProductP1Validation } from "./validation/validate-quote-product-p1";
export {
  validateQuoteProductP2,
  assertHasEntryLayerP2,
  assertHasEntryController,
  assertHasEntryMapper,
  assertHasEntryUIState,
  assertHasEntryValidationModule,
  assertP2NoRuntimeLayerMix,
  assertP2NoPrismaAccess,
  assertP2NoRepositoryAccess,
  assertP2NoDirectExecutionImport,
  assertMountedQuoteEntryLayer,
  assertMountedQuoteEntrySubmission,
} from "./validation/validate-quote-product-p2";
export type { QuoteProductP2Validation } from "./validation/validate-quote-product-p2";
export {
  WORKSPACE_QUOTE_PRODUCT_P1_META,
  WORKSPACE_QUOTE_PRODUCT_P1_TAG,
  V57_QUOTE_P1_VERIFY_CHECKS,
} from "./freeze/v57-p1-meta";
export { WORKSPACE_QUOTE_PRODUCT_P1_FREEZE } from "./freeze/v57-p1-final";
export {
  WORKSPACE_QUOTE_PRODUCT_P2_META,
  WORKSPACE_QUOTE_PRODUCT_P2_TAG,
  V57_QUOTE_P2_VERIFY_CHECKS,
} from "./freeze/v57-p2-meta";
export { WORKSPACE_QUOTE_PRODUCT_P2_FREEZE } from "./freeze/v57-p2-final";
export {
  WORKSPACE_QUOTE_PRODUCT_P3_META,
  WORKSPACE_QUOTE_PRODUCT_P3_TAG,
  V57_QUOTE_P3_VERIFY_CHECKS,
} from "./freeze/v57-p3-meta";
export { WORKSPACE_QUOTE_PRODUCT_P3_FREEZE } from "./freeze/v57-p3-final";
export {
  validateQuoteProductP3,
  assertHasProductServiceP3,
  assertHasProductOrchestratorP3,
  assertHasWorkspaceResolverP3,
  assertHasRuntimeClientOnlyP3,
  assertP3NoPrismaAccess,
  assertP3NoRepositoryAccess,
  assertP3NoDirectExecutionImport,
  assertP3NoUILogicInService,
  assertP3NoRuntimeLayerMix,
  assertMountedQuoteProductServiceLayer,
  assertMountedQuoteProductOrchestration,
} from "./validation/validate-quote-product-p3";
export type { QuoteProductP3Validation } from "./validation/validate-quote-product-p3";
export {
  WORKSPACE_QUOTE_PRODUCT_P4_META,
  WORKSPACE_QUOTE_PRODUCT_P4_TAG,
  V57_QUOTE_P4_VERIFY_CHECKS,
} from "./freeze/v57-p4-meta";
export { WORKSPACE_QUOTE_PRODUCT_P4_FREEZE } from "./freeze/v57-p4-final";
export {
  validateQuoteProductP4,
  assertHasExecutionClientP4,
  assertHasExecutionAdapterP4,
  assertHasExecutionRequestP4,
  assertHasExecutionResponseP4,
  assertHasExecutionErrorP4,
  assertHasExecutionMapperP4,
  assertHasExecutionValidationP4,
  assertP4NoPrismaAccess,
  assertP4NoRepositoryAccess,
  assertP4NoDirectRuntimeImport,
  assertP4NoUILogicInExecution,
  assertP4NoRuntimeLayerMix,
  assertProductExecutionRoutesThroughClientP4,
  assertMountedQuoteExecutionClientLayer,
  assertMountedQuoteExecutionRuntimeBridge,
} from "./validation/validate-quote-product-p4";
export type { QuoteProductP4Validation } from "./validation/validate-quote-product-p4";
export {
  WORKSPACE_QUOTE_PRODUCT_P5_META,
  WORKSPACE_QUOTE_PRODUCT_P5_TAG,
  V57_QUOTE_P5_VERIFY_CHECKS,
} from "./freeze/v57-p5-meta";
export { WORKSPACE_QUOTE_PRODUCT_P5_FREEZE } from "./freeze/v57-p5-final";
export {
  validateQuoteProductP5,
  assertHasUIStateP5,
  assertHasUIMapperP5,
  assertHasViewModelP5,
  assertHasReadinessP5,
  assertHasLoadingStateP5,
  assertHasErrorSurfaceP5,
  assertP5NoRuntimeImport,
  assertP5NoExecutionLogic,
  assertP5NoPrismaAccess,
  assertP5NoRepositoryAccess,
  assertMountedQuoteUIStateMapping,
  assertMountedQuoteUIStateBridge,
} from "./validation/validate-quote-product-p5";
export type { QuoteProductP5Validation } from "./validation/validate-quote-product-p5";
export type {
  QuoteProductSurface as QuoteAssembledProductSurface,
  QuoteProductSurfaceData,
  QuoteProductSurfaceActions,
} from "./surface/quote-product.surface";
export {
  loadQuoteProductSurface,
  buildQuoteProductSurface as buildAssembledQuoteProductSurface,
} from "./surface/quote-product.surface";
export {
  createQuoteSurfaceLoader,
  describeQuoteSurfaceLoader,
} from "./surface/quote-product.loader";
export { buildQuoteProductState } from "./surface/quote-product.state";
export { buildQuoteProductViewModel } from "./surface/quote-product.viewmodel";
export {
  bindQuoteProductActions,
  createQuoteProductSurfaceActions,
} from "./surface/quote-product.actions";
export {
  submitQuoteProductSurfaceAction,
  refreshQuoteProductSurfaceAction,
} from "./surface/quote-product.actions.server";
export type { QuoteProductSurfaceActionResult } from "./surface/quote-product.actions.server";
export { buildQuoteWorkspaceSurface } from "./workspace/quote-workspace.surface";
export type { QuoteWorkspaceSurface } from "./workspace/quote-workspace.surface";
export { QuoteProductPage } from "./portal/quote-product-page";
export {
  QuoteProductPageLoader,
  QuoteProductSurfaceLoader,
  hydrateQuoteProductSurface,
  renderQuoteProductPage,
} from "./portal/quote-product-loader";
export {
  QUOTE_PRODUCT_PORTAL_ROUTE_PATTERN,
  QUOTE_PRODUCT_PORTAL_PAGE_BINDING,
  LEGACY_QUOTE_PORTAL_LOADERS,
  bindQuotePortalRoute,
  resolveQuotePortalWorkspace,
  describeQuoteProductPortalRoute,
  isLegacyQuotePortalLoader,
} from "./portal/quote-product-route";
export {
  QUOTE_WORKSPACE_PORTAL_ROUTE_PATTERN,
  QUOTE_WORKSPACE_PORTAL_SEGMENT,
  resolveQuoteWorkspaceQuoteRoute,
  isQuoteWorkspacePortalRoute,
  describeQuoteWorkspacePortalRoute,
} from "./workspace/quote-workspace.route";
export {
  auditQuotePortalRoutes,
  assertCanonicalQuotePortalRoute,
} from "./integration-check/v57-p7-route-audit";
export type { QuotePortalRouteAudit } from "./integration-check/v57-p7-route-audit";
export {
  checkQuotePortalBypass,
  assertNoLegacyPortalLoaderInAppPage,
  assertPortalUiUsesSurfaceOnly,
} from "./integration-check/v57-p7-bypass-check";
export type { QuotePortalBypassCheck } from "./integration-check/v57-p7-bypass-check";
export {
  WORKSPACE_QUOTE_PRODUCT_P6_META,
  WORKSPACE_QUOTE_PRODUCT_P6_TAG,
  V57_QUOTE_P6_VERIFY_CHECKS,
} from "./freeze/v57-p6-meta";
export { WORKSPACE_QUOTE_PRODUCT_P6_FREEZE } from "./freeze/v57-p6-final";
export {
  validateQuoteProductP6,
  assertHasProductSurfaceP6,
  assertHasSurfaceLoaderP6,
  assertHasSurfaceViewModelP6,
  assertHasSurfaceStateP6,
  assertHasSurfaceActionsP6,
  assertHasWorkspaceSurfaceP6,
  assertHasPortalSurfaceP6,
  assertPortalDoesNotBypassSurfaceP6,
  assertP6NoRuntimeImport,
  assertP6NoExecutionLogic,
  assertP6NoPrismaAccess,
  assertP6NoRepositoryAccess,
  assertMountedQuoteProductSurfaceAssembly,
  assertMountedQuoteProductSurfaceActions,
} from "./validation/validate-quote-product-p6";
export type { QuoteProductP6Validation } from "./validation/validate-quote-product-p6";
export {
  WORKSPACE_QUOTE_PRODUCT_P7_META,
  WORKSPACE_QUOTE_PRODUCT_P7_TAG,
  V57_QUOTE_P7_VERIFY_CHECKS,
} from "./freeze/v57-p7-meta";
export { WORKSPACE_QUOTE_PRODUCT_P7_FREEZE } from "./freeze/v57-p7-final";
export {
  validateQuoteProductP7,
  assertHasSinglePortalEntryP7,
  assertHasSurfaceOnlyRenderingP7,
  assertNoLegacyEntryRouteP7,
  assertNoDirectServiceAccessFromUiP7,
  assertNoExecutionClientInUiP7,
  assertNoRuntimeImportInUiP7,
  assertHasLoaderHydrationP7,
  assertHasRouteConsolidationP7,
  assertMountedQuotePortalWiring,
} from "./validation/validate-quote-product-p7";
export type { QuoteProductP7Validation } from "./validation/validate-quote-product-p7";
export {
  WORKSPACE_QUOTE_PRODUCT_P8_META,
  WORKSPACE_QUOTE_PRODUCT_P8_TAG,
  WORKSPACE_QUOTE_PRODUCT_FINAL_META,
  WORKSPACE_QUOTE_PRODUCT_FINAL_TAG,
  WORKSPACE_QUOTE_PRODUCT_FINAL_VERSION,
  V57_PRODUCT_LOCKED,
  V57_QUOTE_P8_VERIFY_CHECKS,
  V57_PRODUCT_FROZEN,
  V57_QUOTE_PRODUCT_ARCHITECTURE_SNAPSHOT,
  V57_QUOTE_PRODUCT_SURFACE_CONTRACT,
  V57_QUOTE_PRODUCT_EXECUTION_CHAIN,
  V57_QUOTE_PRODUCT_UI_STATE_MODEL,
  V57_QUOTE_PRODUCT_ENTRY_FLOW,
  V57_QUOTE_PRODUCT_RUNTIME_BOUNDARY_RULES,
  V57_QUOTE_PRODUCT_FINAL_VERIFY_CHECKS,
  V57_QUOTE_PRODUCT_LAYER_STACK,
  V57_QUOTE_PRODUCT_PHASE_TAGS,
  WORKSPACE_QUOTE_PRODUCT_FINAL_FREEZE,
} from "./freeze/v57-p8-meta";
export {
  validateQuoteProductP8,
  validateQuoteProductFinal,
  assertV57ProductFrozen,
  assertV57ProductLocked,
  assertAllQuoteProductPhasesPass,
  assertHasFinalFreezeFileP8,
} from "./validation/validate-quote-product-p8";
export type {
  QuoteProductP8Validation,
  QuoteProductFinalValidation,
} from "./validation/validate-quote-product-p8";
