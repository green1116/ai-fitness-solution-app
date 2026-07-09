/**
 * V67 P6 — Observability dashboard report builder (read-only)
 */
import { buildOncallGovernanceReport } from "../oncall/governance.builder";
import { V67_ONCALL_GOVERNANCE_VERSION } from "../oncall/governance.types";

import { buildDashboardCatalogManifest, isDashboardRefsAligned } from "./dashboard.catalog";
import type {
  ObservabilityDashboardReport,
  ObservabilityDashboardSignals,
} from "./governance.types";
import { V67_OBSERVABILITY_DASHBOARD_VERSION } from "./governance.types";
import { buildMetricViewManifest, isSloRefsAligned } from "./metric.view.catalog";
import { buildServiceHealthManifest, isAlertTypeRefsAligned } from "./service.health.catalog";
import { buildStatusSummaryManifest } from "./status.summary.contract";

const DEFAULT_SIGNALS: ObservabilityDashboardSignals = {
  oncallGovernanceReady: true,
  dashboardCatalogComplete: true,
  serviceHealthComplete: true,
  metricViewComplete: true,
  statusSummaryComplete: true,
  sloRefsAligned: true,
};

export function buildObservabilityDashboardReport(input?: {
  deploymentId?: string;
  signals?: ObservabilityDashboardSignals;
}): ObservabilityDashboardReport {
  const deploymentId = input?.deploymentId ?? "v67-observability-dashboard-default";

  const oncallGovernance = buildOncallGovernanceReport({ deploymentId });
  const dashboardCatalog = buildDashboardCatalogManifest();
  const serviceHealth = buildServiceHealthManifest();
  const metricViews = buildMetricViewManifest();
  const statusSummary = buildStatusSummaryManifest();
  const sloAligned = isSloRefsAligned();
  const dashboardAligned = isDashboardRefsAligned();
  const alertAligned = isAlertTypeRefsAligned();
  const refsAligned = sloAligned && dashboardAligned && alertAligned;

  const signals: ObservabilityDashboardSignals = {
    ...DEFAULT_SIGNALS,
    oncallGovernanceReady: oncallGovernance.governanceReady,
    dashboardCatalogComplete: dashboardCatalog.catalogComplete,
    serviceHealthComplete: serviceHealth.catalogComplete,
    metricViewComplete: metricViews.catalogComplete,
    statusSummaryComplete: statusSummary.contractComplete,
    sloRefsAligned: refsAligned,
    ...input?.signals,
  };

  const contractsReady =
    oncallGovernance.governanceReady &&
    dashboardCatalog.catalogComplete &&
    serviceHealth.catalogComplete &&
    metricViews.catalogComplete &&
    statusSummary.contractComplete &&
    sloAligned &&
    dashboardAligned &&
    alertAligned &&
    signals.oncallGovernanceReady !== false;

  return {
    version: V67_OBSERVABILITY_DASHBOARD_VERSION,
    reportId: `observability-dashboard-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    oncallGovernanceVersion: V67_ONCALL_GOVERNANCE_VERSION,
    oncallGovernanceReady: oncallGovernance.governanceReady,
    dashboardCatalog,
    serviceHealth,
    metricViews,
    statusSummary,
    contractsReady,
    readinessScore: contractsReady ? 100 : 0,
    summary: [
      `observability-dashboard ready=${contractsReady}`,
      `dashboards=${dashboardCatalog.dashboardCount}`,
      `services=${serviceHealth.serviceCount}`,
      `views=${metricViews.viewCount}`,
      `summaries=${statusSummary.entryCount}`,
      `sloAligned=${sloAligned}`,
      `dashboardAligned=${dashboardAligned}`,
    ].join(" "),
  };
}

export function assertObservabilityDashboardPass(
  report: ObservabilityDashboardReport,
): asserts report is ObservabilityDashboardReport & { contractsReady: true } {
  if (!report.contractsReady) {
    throw new Error(`V67 observability dashboard not ready: ${report.summary}`);
  }
}
