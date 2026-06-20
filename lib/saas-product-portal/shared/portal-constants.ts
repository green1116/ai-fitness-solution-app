export const SAAS_PRODUCT_PORTAL_P1_TAG = "v52-portal-ui-p1" as const;

export const SAAS_PRODUCT_PORTAL_P2_TAG = "v52-portal-ui-p2" as const;

export const SAAS_PRODUCT_PORTAL_P3_TAG = "v52-portal-ui-p3" as const;

export const SAAS_PRODUCT_PORTAL_P4_TAG = "v52-portal-ui-p4" as const;

export const SAAS_PRODUCT_PORTAL_P5_TAG = "v52-portal-ui-p5" as const;

export const SAAS_PRODUCT_PORTAL_P6_TAG = "v52-portal-ui-p6" as const;

export const SAAS_PRODUCT_PORTAL_VERSION = "v52-portal-ui" as const;

export const SAAS_PRODUCT_PORTAL_ROUTE_PREFIX = "/saas-product" as const;

export const SAAS_PRODUCT_PORTAL_DASHBOARD_PATH = SAAS_PRODUCT_PORTAL_ROUTE_PREFIX;

export const SAAS_PRODUCT_PORTAL_SETTINGS_PATH = `${SAAS_PRODUCT_PORTAL_ROUTE_PREFIX}/settings` as const;

export const SAAS_PRODUCT_PORTAL_WORKSPACES_PATH = `${SAAS_PRODUCT_PORTAL_ROUTE_PREFIX}/workspaces` as const;

export function saasProductPortalWorkspaceDetailPath(workspaceId: string): string {
  return `${SAAS_PRODUCT_PORTAL_WORKSPACES_PATH}/${encodeURIComponent(workspaceId.trim())}`;
}

export function saasProductPortalWorkspaceOverviewPath(workspaceId: string): string {
  return saasProductPortalWorkspaceDetailPath(workspaceId);
}

export function saasProductPortalWorkspaceProductPath(workspaceId: string, segment: string): string {
  return `${saasProductPortalWorkspaceDetailPath(workspaceId)}/${segment}`;
}

export function saasProductPortalWorkspaceQuotesPath(workspaceId: string): string {
  return saasProductPortalWorkspaceProductPath(workspaceId, "quotes");
}

export const SAAS_PRODUCT_API_ROUTE_PREFIX = "/api/saas-product" as const;

export const SAAS_PRODUCT_API_ME_PATH = `${SAAS_PRODUCT_API_ROUTE_PREFIX}/me` as const;

export const SAAS_PRODUCT_API_WORKSPACES_PATH = `${SAAS_PRODUCT_API_ROUTE_PREFIX}/workspaces` as const;

export function saasProductApiWorkspaceDetailPath(workspaceId: string): string {
  return `${SAAS_PRODUCT_API_WORKSPACES_PATH}/${encodeURIComponent(workspaceId.trim())}`;
}

export const V51_API_DEPENDENCY_TAG = "v51-api-exposure-final" as const;

export const PORTAL_SESSION_HEADER_USER_ID = "x-user-id" as const;

export const PORTAL_SESSION_HEADER_USER_EMAIL = "x-user-email" as const;

export const PORTAL_PRODUCT_NAV_PATHS: Record<string, string> = {
  dashboard: SAAS_PRODUCT_PORTAL_DASHBOARD_PATH,
  workspace: SAAS_PRODUCT_PORTAL_WORKSPACES_PATH,
  commercial: `${SAAS_PRODUCT_PORTAL_ROUTE_PREFIX}/commercial`,
  delivery: `${SAAS_PRODUCT_PORTAL_ROUTE_PREFIX}/delivery`,
  performance: `${SAAS_PRODUCT_PORTAL_ROUTE_PREFIX}/performance`,
  billing: `${SAAS_PRODUCT_PORTAL_ROUTE_PREFIX}/billing`,
};
