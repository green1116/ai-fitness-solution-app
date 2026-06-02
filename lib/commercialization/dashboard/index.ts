/**
 * V3.7-H3 Production Dashboard Surface Foundation
 */

export {
  DASHBOARD_SNAPSHOT_VERSION,
  buildDashboardSnapshot,
  type DashboardSnapshot,
  type DashboardStatus,
  type DashboardFreezeStatus,
} from "./dashboard-snapshot";

export {
  RELEASE_CONTROL_SUMMARY_VERSION,
  buildReleaseControlSummary,
  type ReleaseControlSummary,
} from "./release-control-summary";

export {
  OPS_PANEL_MANIFEST_VERSION,
  buildOpsPanelManifest,
  type OpsPanelManifest,
} from "./ops-panel-manifest";

export const PRODUCTION_DASHBOARD_VERSION = "3.7-h3-foundation-1" as const;

import { buildDashboardSnapshot, type DashboardSnapshot } from "./dashboard-snapshot";
import { buildReleaseControlSummary, type ReleaseControlSummary } from "./release-control-summary";
import { buildOpsPanelManifest, type OpsPanelManifest } from "./ops-panel-manifest";

export type ProductionDashboardFoundation = {
  version: typeof PRODUCTION_DASHBOARD_VERSION;
  foundationId: string;
  snapshot: DashboardSnapshot;
  releaseControl: ReleaseControlSummary;
  opsPanel: OpsPanelManifest;
  summary: string;
};

export function buildProductionDashboardFoundation(input?: {
  deploymentId?: string;
}): ProductionDashboardFoundation {
  const deploymentId = input?.deploymentId ?? "dashboard";
  const foundationId = `PD-V37H3-${deploymentId.slice(0, 8)}`;
  const snapshot = buildDashboardSnapshot({ deploymentId });
  const releaseControl = buildReleaseControlSummary({ deploymentId });
  const opsPanel = buildOpsPanelManifest({ deploymentId });

  return {
    version: PRODUCTION_DASHBOARD_VERSION,
    foundationId,
    snapshot,
    releaseControl,
    opsPanel,
    summary: `production-dashboard id=${foundationId} releasable=${snapshot.releasable} releaseReady=${opsPanel.releaseReady} confidence=${releaseControl.confidenceScore}`,
  };
}
