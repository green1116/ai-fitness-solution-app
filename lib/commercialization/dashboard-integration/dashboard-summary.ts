/**
 * V3.7-H14 Unified Dashboard — summary aggregation (readonly)
 */

import { buildProductionGovernanceFoundation } from "../governance/index";
import { buildAuditReviewSurface } from "../audit/audit-review-surface";
import { buildReleaseLedger } from "../release-ledger";
import { buildEnterpriseOpsOverview } from "../portal/index";
import { buildProductionObservabilityFoundation } from "../observability";

export const DASHBOARD_SUMMARY_VERSION = "3.7-h14-summary-1" as const;

export type DashboardSummaryBundle = {
  version: typeof DASHBOARD_SUMMARY_VERSION;
  summaryId: string;
  governanceSummary: string;
  auditSummary: string;
  releaseSummary: string;
  opsSummary: string;
  observabilitySummary: string;
  summary: string;
};

export function buildDashboardSummaryBundle(input?: { deploymentId?: string }): DashboardSummaryBundle {
  const deploymentId = input?.deploymentId ?? "dashboard-summary";
  const summaryId = `DSM-V37H14-${deploymentId.slice(0, 8)}`;
  const governance = buildProductionGovernanceFoundation({ deploymentId });
  const audit = buildAuditReviewSurface({ deploymentId });
  const release = buildReleaseLedger({ deploymentId });
  const ops = buildEnterpriseOpsOverview({ deploymentId });
  const observability = buildProductionObservabilityFoundation({ deploymentId });

  const governanceSummary = governance.summary;
  const auditSummary = audit.auditSummary;
  const releaseSummary = release.ledgerSummary;
  const opsSummary = ops.summary;
  const observabilitySummary = observability.summary;

  return {
    version: DASHBOARD_SUMMARY_VERSION,
    summaryId,
    governanceSummary,
    auditSummary,
    releaseSummary,
    opsSummary,
    observabilitySummary,
    summary: `dashboard-summary id=${summaryId} governance=${governance.manifest.readyForGovernance} audit=${audit.readinessSummary.releasable} release=${release.readiness.releaseReady} ops=${ops.manifest.readyForOps}`,
  };
}
