/**
 * V67 P6 — Observability dashboard entry (read-only)
 */
import { buildObservabilityDashboardReport } from "./governance.builder";
import type {
  ObservabilityDashboardReport,
  ObservabilityDashboardSignals,
} from "./governance.types";

export type { ObservabilityDashboardSignals };

export function runObservabilityDashboard(input?: {
  deploymentId?: string;
  signals?: ObservabilityDashboardSignals;
}): ObservabilityDashboardReport {
  return buildObservabilityDashboardReport(input);
}

export function formatObservabilityDashboardSummary(report: ObservabilityDashboardReport): string {
  const lines = [
    "V67 Observability Dashboard Contracts",
    `  ready: ${report.contractsReady}`,
    `  score: ${report.readinessScore}/100`,
    `  oncall-governance: ${report.oncallGovernanceVersion} (ready=${report.oncallGovernanceReady})`,
    `  dashboards: ${report.dashboardCatalog.dashboardCount}`,
    `  service health: ${report.serviceHealth.serviceCount}`,
    `  metric views: ${report.metricViews.viewCount}`,
    `  status summaries: ${report.statusSummary.entryCount}`,
  ];
  return lines.join("\n");
}
