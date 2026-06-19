export * from "./shared/product-types";
export * from "./shared/product-errors";
export {
  resolveProduct,
  listProducts,
  listProductsForPortal,
  assertProductRegistryAlignedWithV47,
} from "./registry/product-registry";
export {
  WORKFLOW_STAGE_DEFINITIONS,
  resolveWorkflowStage,
  listWorkflowStages,
} from "./registry/workflow-stage-catalog";
export * from "./workspace/workspace-product-types";
export {
  PORTAL_WORKSPACE_PRODUCT_CATALOG,
  listWorkspaceProductsForPortal,
  hasWorkspaceProductsForPortal,
} from "./workspace/workspace-product-catalog";
export { mapProductToV47Module, mapWorkflowToV47Module } from "./mapping/product-to-v47-mapper";
export {
  validateSaasProductP1,
  validateWorkspaceProductBinding,
  assertV48LayersUnmodified,
} from "./validation/validate-saas-product-p1";
export * from "./shared/context-types";
export * from "./shared/context-errors";
export { bindTenantContext } from "./context/tenant-context";
export { bindWorkspaceContext } from "./context/workspace-context";
export { bindProductContext } from "./context/product-context";
export { resolveProductContext } from "./context/resolve-product-context";
export {
  validateProductContextShape,
  validateProductContextCompatibility,
  validateResolvedProductContext,
  validateSaasProductP2ModuleExports,
} from "./validation/validate-saas-product-p2";
export * from "./shared/workspace-runtime-types";
export * from "./shared/workspace-runtime-errors";
export {
  createProductWorkspace,
  resolveWorkspaceProduct,
  listWorkspaceProducts,
  bindWorkspaceProduct,
  mapSaasWorkspaceToV47CustomerWorkspace,
  buildV47CustomerWorkspaceMapping,
  validateV47CustomerWorkspaceMapping,
  assertValidProductContextForWorkspace,
  validateWorkspaceProductInstance,
  clearWorkspaceProductRepository,
  getWorkspaceProductRepositorySize,
} from "./workspace-runtime/workspace-product-runtime";
export { validateSaasProductP3Runtime } from "./validation/validate-saas-product-p3";
export * from "./shared/workflow-runtime-types";
export * from "./shared/workflow-runtime-errors";
export {
  QUOTE_WORKFLOW_STATES,
  QUOTE_WORKFLOW_TRANSITIONS,
} from "./workflow-runtime/workflow-types";
export {
  createQuoteWorkflow,
  resolveWorkflow,
  listWorkflowInstances,
  transitionWorkflow,
  validateTransition,
  getAllowedTransitions,
  assertValidWorkflowState,
  appendWorkflowHistory,
  mapWorkflowToCommercialAdapterContext,
  validateWorkflowInstance,
  assertValidWorkflowInstance,
  clearWorkflowRepository,
  getWorkflowRepositorySize,
  clearWorkflowEvents,
  listWorkflowEvents,
  getWorkflowEventCount,
} from "./workflow-runtime/quote-workflow-runtime";
export { validateSaasProductP4Runtime } from "./validation/validate-saas-product-p4";
export * from "./shared/workflow-p5-types";
export * from "./shared/workflow-runtime-errors-p5";
export {
  APPROVAL_WORKFLOW_STATES,
  APPROVAL_WORKFLOW_TRANSITIONS,
  DELIVERY_WORKFLOW_STATES,
  DELIVERY_WORKFLOW_TRANSITIONS,
  RELEASE_WORKFLOW_STATES,
  RELEASE_WORKFLOW_TRANSITIONS,
  createApprovalWorkflow,
  createDeliveryWorkflow,
  createReleaseWorkflow,
  transitionBusinessWorkflow,
  validateBusinessTransition,
  getBusinessAllowedTransitions,
  assertValidBusinessWorkflowState,
  getInitialBusinessWorkflowState,
  getTerminalBusinessWorkflowState,
  WORKFLOW_DEPENDENCY_RULES,
  getWorkflowDependencyRule,
  checkWorkflowDependency,
  assertWorkflowDependency,
  validateBusinessWorkflowInstance,
  assertValidBusinessWorkflowInstance,
  buildBusinessProcessAdapterContext,
  isBusinessProcessReady,
  recordBusinessProcessReadyEvent,
  clearWorkflowP5Events,
  listWorkflowP5Events,
  getWorkflowP5EventCount,
  recordWorkflowP5Event,
} from "./workflow-runtime/business-process-runtime";
export { validateSaasProductP5Runtime } from "./validation/validate-saas-product-p5";
export * from "./shared/portal-runtime-types";
export * from "./shared/portal-runtime-errors";
export {
  resolvePortalContext,
  composePortalModel,
  buildPortalView,
  listPortalProducts,
  getPortalCapabilities,
  buildPortalRoutingMap,
  resolvePortalRoute,
  PORTAL_ROUTE_PATTERNS,
  readProductContextForPortal,
  readWorkspaceProductsForPortal,
  readWorkspaceProductForPortal,
  readWorkflowsForWorkspaceProduct,
  readAllWorkflowsForPortal,
} from "./portal/portal-runtime";
export { validateSaasProductP6Runtime } from "./validation/validate-saas-product-p6";
export * from "./shared/ops-runtime-types";
export * from "./shared/ops-runtime-errors";
export {
  calculateProductHealth,
  calculateWorkflowMetrics,
  calculateWorkspaceMetrics,
  runHealthChecks,
  activateProduct,
  suspendProduct,
  archiveProduct,
  restoreProduct,
  buildProductOpsDashboard,
  buildProductOpsRuntime,
} from "./ops/ops-runtime";
export { validateSaasProductP7Runtime } from "./validation/validate-saas-product-p7";

export const SAAS_PRODUCT_META = {
  version: "v49-saas-product-p7",
  tag: "v49-saas-product-p7",
  phases: [
    "v49-saas-product-p1",
    "v49-saas-product-p2",
    "v49-saas-product-p3",
    "v49-saas-product-p4",
    "v49-saas-product-p5",
    "v49-saas-product-p6",
    "v49-saas-product-p7",
  ],
} as const;
