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

export const SAAS_PRODUCT_META = {
  version: "v49-saas-product-p1",
  tag: "v49-saas-product-p1",
} as const;
