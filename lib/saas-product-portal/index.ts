export * from "./shared/portal-constants";
export * from "./shared/portal-types";
export * from "./shared/portal-errors";
export { SaasProductApiClient, createSaasProductApiClient } from "./client/saas-product-api-client";
export { usePortalSession } from "./session/use-portal-session";
export { requirePortalSessionServer } from "./session/portal-session-server";
export { getPortalSessionHeaders } from "./session/get-portal-session-headers";
export { PortalShell } from "./layout/portal-shell";
export { buildProductPortalNavigation } from "./layout/portal-navigation";
export { MOCK_PORTAL_KPI } from "./hooks/use-portal-kpi";
export { DashboardKpiCards } from "./components/dashboard-kpi-cards";
export { DashboardPageContent } from "./pages/dashboard-page-content";
export { SettingsPageContent } from "./pages/settings-page-content";
export { validatePortalP1, runPortalBoundaryAudit } from "./validation/validate-portal-p1";
export { SAAS_PRODUCT_PORTAL_P1_FREEZE } from "./freeze/v52-p1-meta";

import {
  SAAS_PRODUCT_PORTAL_P1_TAG,
  SAAS_PRODUCT_PORTAL_VERSION,
  V51_API_DEPENDENCY_TAG,
} from "./shared/portal-constants";

export const SAAS_PRODUCT_PORTAL_META = {
  version: SAAS_PRODUCT_PORTAL_VERSION,
  tag: SAAS_PRODUCT_PORTAL_P1_TAG,
  phase: "v52-portal-ui-p1",
  dependencyTag: V51_API_DEPENDENCY_TAG,
  frozen: false,
} as const;
