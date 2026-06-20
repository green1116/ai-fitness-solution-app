import {
  SAAS_PRODUCT_PORTAL_P5_TAG,
  SAAS_PRODUCT_PORTAL_P6_TAG,
  SAAS_PRODUCT_PORTAL_VERSION,
  SAAS_PRODUCT_PORTAL_WORKSPACES_PATH,
  V51_API_DEPENDENCY_TAG,
} from "../shared/portal-constants";

export const V52_PORTAL_P6_ROUTES = [
  `${SAAS_PRODUCT_PORTAL_WORKSPACES_PATH}/[id]/quotes`,
] as const;

export const V52_PORTAL_P6_VERIFY_CHECKS = [
  "QUOTE_ENTRY_UI_EXISTS",
  "QUOTE_ROUTE_EXISTS",
  "WORKSPACE_NAVIGATION_QUOTES_EXISTS",
  "WORKSPACE_REGISTRY_QUOTES_EXISTS",
  "WORKSPACE_API_ONLY",
  "NO_PRISMA",
  "NO_DIRECT_TENANT_ACCESS",
  "QUOTE_CAPABILITY_ONLY",
] as const;

export const SAAS_PRODUCT_PORTAL_P6_FREEZE = {
  tag: SAAS_PRODUCT_PORTAL_P6_TAG,
  version: SAAS_PRODUCT_PORTAL_VERSION,
  status: "quote-entry-ui",
  frozen: false,
  dependencyTag: SAAS_PRODUCT_PORTAL_P5_TAG,
  apiDependencyTag: V51_API_DEPENDENCY_TAG,
  routes: V52_PORTAL_P6_ROUTES,
  verifyChecks: V52_PORTAL_P6_VERIFY_CHECKS,
  nextHorizon: "Project Entry UI (not started)",
  note: "P6 Quote Entry UI shell on frozen P5 workspace capability foundation",
} as const;
