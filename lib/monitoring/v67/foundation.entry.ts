/**
 * V67 P1 — Monitoring foundation entry (read-only)
 */
import { buildMonitoringFoundationReport } from "./foundation.builder";
import type {
  MonitoringFoundationReport,
  MonitoringFoundationSignals,
} from "./foundation.types";
import type { MonitoringEnvironment } from "./foundation.types";

export type { MonitoringFoundationSignals };

export function runMonitoringFoundation(input?: {
  deploymentId?: string;
  environment?: MonitoringEnvironment;
  signals?: MonitoringFoundationSignals;
}): MonitoringFoundationReport {
  return buildMonitoringFoundationReport(input);
}

export function formatMonitoringFoundationSummary(report: MonitoringFoundationReport): string {
  const lines = [
    "V67 Monitoring & Incident Response Foundation",
    `  ready: ${report.foundationReady}`,
    `  score: ${report.readinessScore}/100`,
    `  environment: ${report.environment}`,
    `  alert rules: ${report.alertContract.ruleCount}`,
    `  incident events: ${report.eventContract.eventCount}`,
    `  SLIs: ${report.sloContract.sliCount} / SLOs: ${report.sloContract.sloCount}`,
    `  on-call entries: ${report.oncallContract.entryCount}`,
    `  upstream frozen: ${report.upstreamFrozenIntact}`,
  ];
  return lines.join("\n");
}
