export const SAAS_PRODUCT_PORTAL_P1_TAG = "v52-portal-ui-p1" as const;

export const SAAS_PRODUCT_PORTAL_VERSION = "v52-portal-ui" as const;

export const SAAS_PRODUCT_PORTAL_ROUTE_PREFIX = "/saas-product" as const;

export const SAAS_PRODUCT_PORTAL_DASHBOARD_PATH = SAAS_PRODUCT_PORTAL_ROUTE_PREFIX;

export const SAAS_PRODUCT_PORTAL_SETTINGS_PATH = `${SAAS_PRODUCT_PORTAL_ROUTE_PREFIX}/settings` as const;

export const SAAS_PRODUCT_API_ROUTE_PREFIX = "/api/saas-product" as const;

export const SAAS_PRODUCT_API_ME_PATH = `${SAAS_PRODUCT_API_ROUTE_PREFIX}/me` as const;

export const V51_API_DEPENDENCY_TAG = "v51-api-exposure-final" as const;

export const PORTAL_PRODUCT_NAV_PATHS: Record<string, string> = {
  dashboard: SAAS_PRODUCT_PORTAL_DASHBOARD_PATH,
  workspace: `${SAAS_PRODUCT_PORTAL_ROUTE_PREFIX}/workspaces`,
  commercial: `${SAAS_PRODUCT_PORTAL_ROUTE_PREFIX}/commercial`,
  delivery: `${SAAS_PRODUCT_PORTAL_ROUTE_PREFIX}/delivery`,
  performance: `${SAAS_PRODUCT_PORTAL_ROUTE_PREFIX}/performance`,
  billing: `${SAAS_PRODUCT_PORTAL_ROUTE_PREFIX}/billing`,
};
