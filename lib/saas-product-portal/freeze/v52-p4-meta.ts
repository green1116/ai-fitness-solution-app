import {
  SAAS_PRODUCT_PORTAL_P3_TAG,
  SAAS_PRODUCT_PORTAL_P4_TAG,
  SAAS_PRODUCT_PORTAL_VERSION,
  SAAS_PRODUCT_PORTAL_WORKSPACES_PATH,
  V51_API_DEPENDENCY_TAG,
} from "../shared/portal-constants";

export const V52_PORTAL_P4_ROUTES = [
  SAAS_PRODUCT_PORTAL_WORKSPACES_PATH,
  `${SAAS_PRODUCT_PORTAL_WORKSPACES_PATH}/[id]`,
] as const;

export const V52_PORTAL_P4_VERIFY_CHECKS = [
  "WORKSPACE_ROUTE_EXISTS",
  "WORKSPACE_API_ONLY",
  "NO_PRISMA",
  "NO_DIRECT_TENANT_ACCESS",
  "PORTAL_SESSION_REQUIRED",
  "WORKSPACE_DEEPENING_ONLY",
] as const;

export const SAAS_PRODUCT_PORTAL_P4_FREEZE = {
  tag: SAAS_PRODUCT_PORTAL_P4_TAG,
  version: SAAS_PRODUCT_PORTAL_VERSION,
  status: "deepening",
  frozen: false,
  dependencyTag: SAAS_PRODUCT_PORTAL_P3_TAG,
  apiDependencyTag: V51_API_DEPENDENCY_TAG,
  routes: V52_PORTAL_P4_ROUTES,
  verifyChecks: V52_PORTAL_P4_VERIFY_CHECKS,
  nextHorizon: "Deeper workspace capabilities (not started)",
  note: "P4 workspace UI deepening delivered on top of frozen P3 routes",
} as const;
