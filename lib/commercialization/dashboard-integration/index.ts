/**
 * V3.7-H14 Unified Enterprise Dashboard Integration Foundation
 */

export {
  DASHBOARD_INTEGRATION_VERSION,
  buildDashboardIntegration,
  type DashboardIntegration,
  type DashboardWidget,
  type DashboardWidgetStatus,
  type DashboardIntegrationSection,
} from "./dashboard-integration";

export {
  DASHBOARD_MANIFEST_VERSION,
  DASHBOARD_INTEGRATION_FOUNDATION_VERSION,
  buildDashboardIntegrationManifest,
  type DashboardIntegrationManifest,
} from "./dashboard-manifest";

export {
  DASHBOARD_SUMMARY_VERSION,
  buildDashboardSummaryBundle,
  type DashboardSummaryBundle,
} from "./dashboard-summary";

import { DASHBOARD_INTEGRATION_FOUNDATION_VERSION } from "./dashboard-manifest";
import { buildDashboardIntegration, type DashboardIntegration } from "./dashboard-integration";
import { buildDashboardIntegrationManifest, type DashboardIntegrationManifest } from "./dashboard-manifest";
import { buildDashboardSummaryBundle, type DashboardSummaryBundle } from "./dashboard-summary";

export const PRODUCTION_DASHBOARD_INTEGRATION_VERSION = DASHBOARD_INTEGRATION_FOUNDATION_VERSION;

export type UnifiedDashboardOverview = {
  version: typeof PRODUCTION_DASHBOARD_INTEGRATION_VERSION;
  overviewId: string;
  integration: DashboardIntegration;
  manifest: DashboardIntegrationManifest;
  summaries: DashboardSummaryBundle;
  summary: string;
};

export function buildUnifiedDashboardOverview(input?: {
  deploymentId?: string;
}): UnifiedDashboardOverview {
  const deploymentId = input?.deploymentId ?? "dashboard-overview";
  const overviewId = `UDO-V37H14-${deploymentId.slice(0, 8)}`;
  const integration = buildDashboardIntegration({ deploymentId });
  const manifest = buildDashboardIntegrationManifest({ deploymentId });
  const summaries = buildDashboardSummaryBundle({ deploymentId });

  return {
    version: PRODUCTION_DASHBOARD_INTEGRATION_VERSION,
    overviewId,
    integration,
    manifest,
    summaries,
    summary: `unified-dashboard-overview id=${overviewId} readyForDashboard=${manifest.readyForDashboard} widgets=${integration.widgets.length} governance=${integration.governanceWidgets.length}`,
  };
}
