/**
 * V3.7-H14 Unified Dashboard — integration manifest (static aggregation)
 */

import { PRODUCTION_OPS_PORTAL_VERSION } from "../ops";
import { GOVERNANCE_VERSION } from "../governance/governance-manifest";
import { PRODUCTION_AUDIT_VERSION } from "../audit";
import { PRODUCTION_RELEASE_LEDGER_VERSION } from "../release-ledger";
import { buildEnterpriseOpsManifest } from "../portal/enterprise-ops-manifest";
import { buildOpsPortalManifest } from "../ops/ops-portal-manifest";

export const DASHBOARD_MANIFEST_VERSION = "3.7-h14-manifest-1" as const;
export const DASHBOARD_INTEGRATION_FOUNDATION_VERSION = "3.7-h14-foundation-1" as const;

export type DashboardIntegrationManifest = {
  version: typeof DASHBOARD_MANIFEST_VERSION;
  manifestId: string;
  DASHBOARD_INTEGRATION_VERSION: typeof DASHBOARD_INTEGRATION_FOUNDATION_VERSION;
  OPS_PORTAL_VERSION: typeof PRODUCTION_OPS_PORTAL_VERSION;
  GOVERNANCE_VERSION: typeof GOVERNANCE_VERSION;
  AUDIT_VERSION: typeof PRODUCTION_AUDIT_VERSION;
  RELEASE_LEDGER_VERSION: typeof PRODUCTION_RELEASE_LEDGER_VERSION;
  readyForDashboard: boolean;
  readyForGovernance: boolean;
  readyForAudit: boolean;
  readyForRelease: boolean;
  summary: string;
};

export function buildDashboardIntegrationManifest(input?: {
  deploymentId?: string;
}): DashboardIntegrationManifest {
  const deploymentId = input?.deploymentId ?? "dashboard-manifest";
  const manifestId = `DMF-V37H14-${deploymentId.slice(0, 8)}`;
  const ops = buildEnterpriseOpsManifest({ deploymentId });
  const portal = buildOpsPortalManifest({ deploymentId });

  const readyForDashboard =
    ops.readyForOps && portal.dashboardStatus === "pass" && portal.buildStatus === "pass";
  const readyForAudit = portal.auditStatus === "pass" && ops.readyForGovernance;
  const readyForGovernance = ops.readyForGovernance;
  const readyForRelease = ops.readyForRelease;

  return {
    version: DASHBOARD_MANIFEST_VERSION,
    manifestId,
    DASHBOARD_INTEGRATION_VERSION: DASHBOARD_INTEGRATION_FOUNDATION_VERSION,
    OPS_PORTAL_VERSION: PRODUCTION_OPS_PORTAL_VERSION,
    GOVERNANCE_VERSION: GOVERNANCE_VERSION,
    AUDIT_VERSION: PRODUCTION_AUDIT_VERSION,
    RELEASE_LEDGER_VERSION: PRODUCTION_RELEASE_LEDGER_VERSION,
    readyForDashboard,
    readyForGovernance,
    readyForAudit,
    readyForRelease,
    summary: `dashboard-manifest id=${manifestId} readyForDashboard=${readyForDashboard} readyForGovernance=${readyForGovernance} readyForAudit=${readyForAudit} readyForRelease=${readyForRelease}`,
  };
}
