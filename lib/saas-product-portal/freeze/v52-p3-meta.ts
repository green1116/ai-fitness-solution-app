import {
  SAAS_PRODUCT_PORTAL_P2_TAG,
  SAAS_PRODUCT_PORTAL_P3_TAG,
  SAAS_PRODUCT_PORTAL_VERSION,
  SAAS_PRODUCT_PORTAL_WORKSPACES_PATH,
  V51_API_DEPENDENCY_TAG,
} from "../shared/portal-constants";

export const V52_PORTAL_P3_ROUTES = [
  SAAS_PRODUCT_PORTAL_WORKSPACES_PATH,
  `${SAAS_PRODUCT_PORTAL_WORKSPACES_PATH}/[id]`,
] as const;

export const V52_PORTAL_P3_VERIFY_CHECKS = [
  "WORKSPACE_ROUTE_EXISTS",
  "WORKSPACE_API_ONLY",
  "NO_PRISMA",
  "NO_DIRECT_TENANT_ACCESS",
  "NO_V49_V50",
  "PORTAL_SESSION_REQUIRED",
] as const;

export const SAAS_PRODUCT_PORTAL_P3_FREEZE = {
  tag: SAAS_PRODUCT_PORTAL_P3_TAG,
  version: SAAS_PRODUCT_PORTAL_VERSION,
  status: "foundation",
  frozen: false,
  dependencyTag: SAAS_PRODUCT_PORTAL_P2_TAG,
  apiDependencyTag: V51_API_DEPENDENCY_TAG,
  routes: V52_PORTAL_P3_ROUTES,
  verifyChecks: V52_PORTAL_P3_VERIFY_CHECKS,
  nextHorizon: "Workspace UI deepening (not started)",
  note: "P3 workspace UI foundation delivered; phase freeze tag optional after review",
} as const;
