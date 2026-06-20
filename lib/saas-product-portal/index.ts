export * from "./shared/portal-constants";
export * from "./shared/portal-types";
export * from "./shared/portal-errors";
export { SaasProductApiClient, createSaasProductApiClient } from "./client/saas-product-api-client";
export { createAuthedPortalApiClient } from "./client/create-portal-api-client";
export { WorkspaceApiClient, createWorkspaceApiClient } from "./client/workspace-api-client";
export {
  listWorkspacesAction,
  getWorkspaceAction,
  createWorkspaceAction,
  updateWorkspaceStatusAction,
} from "./client/workspace-api-actions";
export { usePortalSession } from "./session/use-portal-session";
export { requirePortalSession, requirePortalSessionServer } from "./session/require-portal-session";
export { getPortalSessionHeaders } from "./session/get-portal-session-headers";
export { fetchPortalSessionViaMeAction } from "./session/fetch-portal-session-action";
export { resolveSessionUserFromCookieOrHeaders } from "./session/resolve-cookie-session-user";
export { PortalShell } from "./layout/portal-shell";
export { buildProductPortalNavigation } from "./layout/portal-navigation";
export { MOCK_PORTAL_KPI } from "./hooks/use-portal-kpi";
export { useWorkspaces } from "./hooks/use-workspaces";
export { useWorkspace } from "./hooks/use-workspace";
export { useWorkspaceList } from "./hooks/use-workspace-list";
export { useWorkspaceDetail } from "./hooks/use-workspace-detail";
export { useWorkspaceContext } from "./hooks/use-workspace-context";
export { useWorkspaceRefresh } from "./hooks/use-workspace-refresh";
export { WorkspaceContextProvider } from "./workspace-capability/workspace-context-provider";
export { WORKSPACE_PRODUCT_ENTRY_REGISTRY } from "./workspace-capability/workspace-entry-registry";
export { WORKSPACE_PRODUCT_NAV_ITEMS } from "./workspace-capability/workspace-product-navigation";
export { WorkspaceProductLayout } from "./layout/workspace-product-layout";
export { WorkspaceProductShell } from "./layout/workspace-product-shell";
export { WorkspaceDashboardOverview } from "./components/workspace-dashboard-overview";
export { WorkspaceProductNav } from "./components/workspace-product-nav";
export { WorkspaceEntryGrid } from "./components/workspace-entry-grid";
export { DashboardKpiCards } from "./components/dashboard-kpi-cards";
export { WorkspaceCreateForm } from "./components/workspace-create-form";
export { WorkspaceCreateFormEnhanced } from "./components/workspace-create-form-enhanced";
export { WorkspaceDetailCard } from "./components/workspace-detail-card";
export { WorkspaceEmptyState } from "./components/workspace-empty-state";
export { WorkspaceList } from "./components/workspace-list";
export { WorkspaceListEnhanced } from "./components/workspace-list-enhanced";
export { WorkspaceListToolbar } from "./components/workspace-list-toolbar";
export { WorkspaceMetadataPanel } from "./components/workspace-metadata-panel";
export { WorkspacePanel } from "./components/workspace-panel";
export { WorkspaceStatusActions } from "./components/workspace-status-actions";
export { DashboardPageContent } from "./pages/dashboard-page-content";
export { SettingsPageContent } from "./pages/settings-page-content";
export { WorkspacesListPageContent } from "./pages/workspaces-list-page-content";
export { WorkspaceDetailPageContent } from "./pages/workspace-detail-page-content";
export { WorkspaceOverviewPageContent } from "./pages/workspace-overview-page-content";
export { WorkspaceEntryPlaceholderPageContent } from "./pages/workspace-entry-placeholder-page-content";
export { QuoteEntryPageContent } from "./pages/quote-entry-page-content";
export { QuoteEntryHeader } from "./components/quote-entry-header";
export { QuoteEntryCard } from "./components/quote-entry-card";
export { QuoteEntryEmptyState } from "./components/quote-entry-empty-state";
export {
  QUOTE_ENTRY_REGISTRY_KEY,
  QUOTE_ENTRY_REGISTRY_MOUNT,
  QUOTE_ENTRY_REGISTRY_SEGMENT,
  assertQuoteEntryRegisteredInWorkspaceRegistry,
  getQuoteEntryFromWorkspaceRegistry,
} from "./quote-entry/quote-entry-registry-extension";
export {
  QUOTE_ENTRY_NAV_KEY,
  QUOTE_ENTRY_NAV_MOUNT,
  assertQuotesNavExistsInWorkspaceNavigation,
  getQuoteNavItemFromWorkspaceNavigation,
  resolveQuoteEntryHref,
} from "./quote-entry/quote-entry-navigation-extension";
export { QUOTE_ENTRY_STATUS_VIEW, getQuoteEntryStatusView } from "./quote-entry/quote-entry-status";
export { QUOTE_ENTRY_PLACEHOLDER_CARDS, listQuoteEntryPlaceholderCards } from "./quote-entry/quote-entry-placeholder-cards";
export { ProjectEntryPageContent } from "./pages/project-entry-page-content";
export { ProjectEntryHeader } from "./components/project-entry-header";
export { ProjectEntryCard } from "./components/project-entry-card";
export { ProjectEntryEmptyState } from "./components/project-entry-empty-state";
export {
  PROJECT_ENTRY_REGISTRY_KEY,
  PROJECT_ENTRY_REGISTRY_MOUNT,
  PROJECT_ENTRY_REGISTRY_SEGMENT,
  assertProjectEntryRegisteredInWorkspaceRegistry,
  getProjectEntryFromWorkspaceRegistry,
} from "./project-entry/project-entry-registry-extension";
export {
  PROJECT_ENTRY_NAV_KEY,
  PROJECT_ENTRY_NAV_MOUNT,
  assertProjectsNavExistsInWorkspaceNavigation,
  getProjectNavItemFromWorkspaceNavigation,
  resolveProjectEntryHref,
} from "./project-entry/project-entry-navigation-extension";
export { PROJECT_ENTRY_STATUS_VIEW, getProjectEntryStatusView } from "./project-entry/project-entry-status";
export { PROJECT_ENTRY_PLACEHOLDER_CARDS, listProjectEntryPlaceholderCards } from "./project-entry/project-entry-placeholder-cards";
export { validatePortalP1, runPortalBoundaryAudit } from "./validation/validate-portal-p1";
export { validatePortalSession, assertPortalSessionResolverContract } from "./validation/validate-session";
export { validatePortalP3, assertWorkspaceApiClientContract } from "./validation/validate-workspace-p3";
export { validatePortalP4, assertWorkspaceDeepeningClientContract } from "./validation/validate-workspace-p4";
export { validatePortalP5, assertWorkspaceContextContract, assertWorkspaceCapabilityOnlyScope } from "./validation/validate-workspace-p5";
export {
  validatePortalP6,
  assertQuoteEntryUiContract,
  assertQuoteCapabilityOnlyScope,
} from "./validation/validate-workspace-p6";
export {
  validatePortalP7,
  assertProjectEntryUiContract,
  assertProjectCapabilityOnlyScope,
} from "./validation/validate-workspace-p7";
export { applyWorkspaceListQuery, DEFAULT_WORKSPACE_LIST_QUERY } from "./workspace/workspace-list-utils";
export { validateWorkspaceName, getWorkspaceNameConstraints } from "./workspace/workspace-create-validation";
export { formatPortalTimestamp, formatPortalRelativeTimestamp } from "./workspace/workspace-format";
export { SAAS_PRODUCT_PORTAL_P1_FREEZE } from "./freeze/v52-p1-meta";
export { SAAS_PRODUCT_PORTAL_P2_FREEZE } from "./freeze/v52-p2-meta";
export { SAAS_PRODUCT_PORTAL_P3_FREEZE } from "./freeze/v52-p3-meta";
export { SAAS_PRODUCT_PORTAL_P4_FREEZE } from "./freeze/v52-p4-meta";
export { SAAS_PRODUCT_PORTAL_P5_FREEZE } from "./freeze/v52-p5-meta";
export { SAAS_PRODUCT_PORTAL_P6_FREEZE } from "./freeze/v52-p6-meta";
export { SAAS_PRODUCT_PORTAL_P7_FREEZE } from "./freeze/v52-p7-meta";

export { SAAS_PRODUCT_PORTAL_META } from "./index-meta";
