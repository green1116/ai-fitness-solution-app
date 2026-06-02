/**
 * V3.7-H15 Enterprise Command Center — summary aggregation (readonly)
 */

import { buildEnterpriseOpsOverview } from "../portal/index";
import { buildUnifiedDashboardOverview } from "../dashboard-integration/index";
import { buildProductionGovernanceFoundation } from "../governance/index";
import { buildAuditReviewSurface } from "../audit/audit-review-surface";
import { buildReleaseLedger } from "../release-ledger";
import { buildProductionAccessControlFoundation } from "../access";
import { buildProductionObservabilityFoundation } from "../observability";

export const COMMAND_CENTER_SUMMARY_VERSION = "3.7-h15-summary-1" as const;

export type CommandCenterReadinessSummary = {
  readyForOps: boolean;
  readyForDashboard: boolean;
  readyForGovernance: boolean;
  readyForRelease: boolean;
  readyForAudit: boolean;
  readyForAccess: boolean;
  readyForObservability: boolean;
  summary: string;
};

export type CommandCenterSummary = {
  version: typeof COMMAND_CENTER_SUMMARY_VERSION;
  summaryId: string;
  opsSummary: string;
  dashboardSummary: string;
  releaseSummary: string;
  auditSummary: string;
  governanceSummary: string;
  accessSummary: string;
  observabilitySummary: string;
  readinessSummary: CommandCenterReadinessSummary;
  summary: string;
};

export function buildCommandCenterSummary(input?: { deploymentId?: string }): CommandCenterSummary {
  const deploymentId = input?.deploymentId ?? "command-center-summary";
  const summaryId = `CCS-V37H15-${deploymentId.slice(0, 8)}`;
  const ops = buildEnterpriseOpsOverview({ deploymentId });
  const dashboard = buildUnifiedDashboardOverview({ deploymentId });
  const governance = buildProductionGovernanceFoundation({ deploymentId });
  const audit = buildAuditReviewSurface({ deploymentId });
  const release = buildReleaseLedger({ deploymentId });
  const access = buildProductionAccessControlFoundation({ deploymentId });
  const observability = buildProductionObservabilityFoundation({ deploymentId });

  const readinessSummary: CommandCenterReadinessSummary = {
    readyForOps: ops.manifest.readyForOps,
    readyForDashboard: dashboard.manifest.readyForDashboard,
    readyForGovernance: governance.manifest.readyForGovernance,
    readyForRelease: release.readiness.releaseReady,
    readyForAudit: dashboard.manifest.readyForAudit,
    readyForAccess: access.manifest.readyForReview,
    readyForObservability: ops.manifest.readyForOps,
    summary: `readiness ops=${ops.manifest.readyForOps} dashboard=${dashboard.manifest.readyForDashboard} governance=${governance.manifest.readyForGovernance} release=${release.readiness.releaseReady}`,
  };

  return {
    version: COMMAND_CENTER_SUMMARY_VERSION,
    summaryId,
    opsSummary: ops.summary,
    dashboardSummary: dashboard.summary,
    releaseSummary: release.ledgerSummary,
    auditSummary: audit.auditSummary,
    governanceSummary: governance.summary,
    accessSummary: access.summary,
    observabilitySummary: observability.summary,
    readinessSummary,
    summary: `command-center-summary id=${summaryId} readyForOps=${readinessSummary.readyForOps} readyForGovernance=${readinessSummary.readyForGovernance} readyForRelease=${readinessSummary.readyForRelease}`,
  };
}
