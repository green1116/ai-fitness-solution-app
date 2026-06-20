import {
  SAAS_PRODUCT_PORTAL_P7_TAG,
  SAAS_PRODUCT_PORTAL_P8_TAG,
  SAAS_PRODUCT_PORTAL_VERSION,
  SAAS_PRODUCT_PORTAL_WORKSPACES_PATH,
  V51_API_DEPENDENCY_TAG,
} from "../shared/portal-constants";

export const V52_PORTAL_P8_ROUTES = [
  `${SAAS_PRODUCT_PORTAL_WORKSPACES_PATH}/[id]/reports`,
] as const;

export const V52_PORTAL_P8_VERIFY_CHECKS = [
  "REPORT_ENTRY_UI_EXISTS",
  "REPORT_ROUTE_EXISTS",
  "WORKSPACE_NAVIGATION_REPORTS_EXISTS",
  "WORKSPACE_REGISTRY_REPORTS_EXISTS",
  "WORKSPACE_API_ONLY",
  "NO_PRISMA",
  "NO_DIRECT_TENANT_ACCESS",
  "REPORT_CAPABILITY_ONLY",
] as const;

export const SAAS_PRODUCT_PORTAL_P8_FREEZE = {
  tag: SAAS_PRODUCT_PORTAL_P8_TAG,
  version: SAAS_PRODUCT_PORTAL_VERSION,
  status: "report-entry-ui",
  frozen: false,
  dependencyTag: SAAS_PRODUCT_PORTAL_P7_TAG,
  apiDependencyTag: V51_API_DEPENDENCY_TAG,
  routes: V52_PORTAL_P8_ROUTES,
  verifyChecks: V52_PORTAL_P8_VERIFY_CHECKS,
  nextHorizon: "V52 Final Freeze (not started)",
  note: "P8 Report Entry UI shell on frozen P7 project entry foundation",
} as const;
