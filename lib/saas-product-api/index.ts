import {
  SAAS_PRODUCT_API_P6_TAG,
  SAAS_PRODUCT_API_VERSION,
  V50_PERSISTENCE_DEPENDENCY_TAG,
} from "./shared/api-constants";

export * from "./shared/api-constants";
export * from "./shared/api-types";
export * from "./shared/api-errors";
export { getPersistenceRuntime, resetPersistenceRuntimeForTests } from "./adapter/get-persistence-runtime";
export { resolveApiTenant } from "./auth/resolve-api-tenant";
export { withApiContext } from "./auth/with-api-context";
export { handleHealth } from "./handlers/health-handlers";
export { handleMe } from "./handlers/me-handlers";
export {
  handleCreateWorkspace,
  handleGetWorkspace,
  handleListWorkspaces,
  handleUpdateWorkspaceStatus,
} from "./handlers/workspace-handlers";
export {
  handleCreateQuote,
  handleGetQuote,
  handleListQuotes,
  handleUpdateQuote,
} from "./handlers/quote-handlers";
export {
  handleGetWorkflow,
  handleListWorkflows,
  handleTransitionWorkflow,
} from "./handlers/workflow-handlers";
export { handleListWorkflowEvents, handleListWorkflowHistory } from "./handlers/audit-handlers";
export { validateApiP1 } from "./validation/validate-api-p1";
export { validateApiP2 } from "./validation/validate-api-p2";
export { validateApiP3 } from "./validation/validate-api-p3";
export { validateApiP4 } from "./validation/validate-api-p4";
export { validateApiP5 } from "./validation/validate-api-p5";
export { validateApiP6 } from "./validation/validate-api-p6";

export const SAAS_PRODUCT_API_META = {
  version: SAAS_PRODUCT_API_VERSION,
  tag: SAAS_PRODUCT_API_P6_TAG,
  phase: "v51-api-exposure-p6",
  dependencyTag: V50_PERSISTENCE_DEPENDENCY_TAG,
} as const;
