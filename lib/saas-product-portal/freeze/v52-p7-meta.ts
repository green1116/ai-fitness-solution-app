import {
  SAAS_PRODUCT_PORTAL_P6_TAG,
  SAAS_PRODUCT_PORTAL_P7_TAG,
  SAAS_PRODUCT_PORTAL_VERSION,
  SAAS_PRODUCT_PORTAL_WORKSPACES_PATH,
  V51_API_DEPENDENCY_TAG,
} from "../shared/portal-constants";

export const V52_PORTAL_P7_ROUTES = [
  `${SAAS_PRODUCT_PORTAL_WORKSPACES_PATH}/[id]/projects`,
] as const;

export const V52_PORTAL_P7_VERIFY_CHECKS = [
  "PROJECT_ENTRY_UI_EXISTS",
  "PROJECT_ROUTE_EXISTS",
  "WORKSPACE_NAVIGATION_PROJECTS_EXISTS",
  "WORKSPACE_REGISTRY_PROJECTS_EXISTS",
  "WORKSPACE_API_ONLY",
  "NO_PRISMA",
  "NO_DIRECT_TENANT_ACCESS",
  "PROJECT_CAPABILITY_ONLY",
] as const;

export const SAAS_PRODUCT_PORTAL_P7_FREEZE = {
  tag: SAAS_PRODUCT_PORTAL_P7_TAG,
  version: SAAS_PRODUCT_PORTAL_VERSION,
  status: "project-entry-ui",
  frozen: false,
  dependencyTag: SAAS_PRODUCT_PORTAL_P6_TAG,
  apiDependencyTag: V51_API_DEPENDENCY_TAG,
  routes: V52_PORTAL_P7_ROUTES,
  verifyChecks: V52_PORTAL_P7_VERIFY_CHECKS,
  nextHorizon: "Report Entry UI (not started)",
  note: "P7 Project Entry UI shell on frozen P6 quote entry foundation",
} as const;
