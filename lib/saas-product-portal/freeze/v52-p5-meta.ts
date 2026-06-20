import {
  SAAS_PRODUCT_PORTAL_P4_TAG,
  SAAS_PRODUCT_PORTAL_P5_TAG,
  SAAS_PRODUCT_PORTAL_VERSION,
  SAAS_PRODUCT_PORTAL_WORKSPACES_PATH,
  V51_API_DEPENDENCY_TAG,
} from "../shared/portal-constants";

export const V52_PORTAL_P5_ROUTES = [
  SAAS_PRODUCT_PORTAL_WORKSPACES_PATH,
  `${SAAS_PRODUCT_PORTAL_WORKSPACES_PATH}/[id]`,
  `${SAAS_PRODUCT_PORTAL_WORKSPACES_PATH}/[id]/projects`,
  `${SAAS_PRODUCT_PORTAL_WORKSPACES_PATH}/[id]/quotes`,
  `${SAAS_PRODUCT_PORTAL_WORKSPACES_PATH}/[id]/reports`,
] as const;

export const V52_PORTAL_P5_VERIFY_CHECKS = [
  "WORKSPACE_CONTEXT_EXISTS",
  "WORKSPACE_DASHBOARD_EXISTS",
  "WORKSPACE_ENTRY_REGISTRY_EXISTS",
  "WORKSPACE_API_ONLY",
  "NO_PRISMA",
  "NO_DIRECT_TENANT_ACCESS",
  "WORKSPACE_CAPABILITY_ONLY",
] as const;

export const SAAS_PRODUCT_PORTAL_P5_FREEZE = {
  tag: SAAS_PRODUCT_PORTAL_P5_TAG,
  version: SAAS_PRODUCT_PORTAL_VERSION,
  status: "capability-foundation",
  frozen: false,
  dependencyTag: SAAS_PRODUCT_PORTAL_P4_TAG,
  apiDependencyTag: V51_API_DEPENDENCY_TAG,
  routes: V52_PORTAL_P5_ROUTES,
  verifyChecks: V52_PORTAL_P5_VERIFY_CHECKS,
  nextHorizon: "Workspace Business Layer (not started)",
  note: "P5 workspace product capability foundation on frozen P4 deepening",
} as const;
