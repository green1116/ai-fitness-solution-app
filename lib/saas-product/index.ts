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

export const SAAS_PRODUCT_META = {
  version: "v49-saas-product-p3",
  tag: "v49-saas-product-p3",
  phases: ["v49-saas-product-p1", "v49-saas-product-p2", "v49-saas-product-p3"],
} as const;
