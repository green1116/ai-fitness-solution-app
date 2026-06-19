import {
  SAAS_PRODUCT_PORTAL_P1_TAG,
  SAAS_PRODUCT_PORTAL_P2_TAG,
  SAAS_PRODUCT_PORTAL_VERSION,
  V51_API_DEPENDENCY_TAG,
} from "../shared/portal-constants";

export const V52_PORTAL_P2_SESSION_FLOW =
  "cookie → session user → membership → tenant → GET /api/saas-product/me → portal session → portal UI" as const;

export const V52_PORTAL_P2_VERIFY_CHECKS = [
  "SESSION_NO_TENANT_PARAM",
  "COOKIE_RESOLUTION",
  "ME_ENDPOINT_USAGE",
  "NO_DIRECT_TENANT_ACCESS",
  "NO_PRISMA",
  "NO_V49_V50",
] as const;

export const V52_PORTAL_P2_DELIVERABLES = [
  "lib/saas-product-portal/session/resolve-cookie-session-user.ts",
  "lib/saas-product-portal/session/get-portal-session-headers.ts",
  "lib/saas-product-portal/session/resolve-portal-session.ts",
  "lib/saas-product-portal/session/require-portal-session.ts",
  "lib/saas-product-portal/session/use-portal-session.ts",
  "lib/saas-product-portal/session/fetch-portal-session-action.ts",
  "lib/saas-product-portal/validation/validate-session.ts",
  "app/saas-product/layout.tsx",
  "app/saas-product/settings/page.tsx",
  "scripts/verify-v52-p2.ts",
] as const;

export const SAAS_PRODUCT_PORTAL_P2_FREEZE = {
  tag: SAAS_PRODUCT_PORTAL_P2_TAG,
  version: SAAS_PRODUCT_PORTAL_VERSION,
  status: "freeze-ready",
  frozen: true,
  dependencyTag: SAAS_PRODUCT_PORTAL_P1_TAG,
  apiDependencyTag: V51_API_DEPENDENCY_TAG,
  sessionFlow: V52_PORTAL_P2_SESSION_FLOW,
  verifyChecks: V52_PORTAL_P2_VERIFY_CHECKS,
  deliverables: V52_PORTAL_P2_DELIVERABLES,
  routes: ["/saas-product", "/saas-product/settings"],
  nextHorizon: "V52 P3 Workspace UI (not started)",
  note: "P2 session & tenant wiring locked at freeze-ready. V52 final freeze remains P8.",
} as const;

export type SaasProductPortalP2Freeze = typeof SAAS_PRODUCT_PORTAL_P2_FREEZE;
