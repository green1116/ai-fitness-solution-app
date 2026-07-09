/**
 * V67 P8 — Monitoring sign-off entry (read-only)
 */
import { buildMonitoringSignoffReport } from "./signoff.builder";
import type { MonitoringSignoffReport, MonitoringSignoffSignals } from "./signoff.types";

export type { MonitoringSignoffSignals };

export function runMonitoringSignoff(input?: {
  deploymentId?: string;
  signals?: MonitoringSignoffSignals;
}): MonitoringSignoffReport {
  return buildMonitoringSignoffReport(input);
}

export function closeV67Monitoring(input?: {
  deploymentId?: string;
  signals?: MonitoringSignoffSignals;
}): MonitoringSignoffReport {
  return buildMonitoringSignoffReport(input);
}

export function formatMonitoringSignoffSummary(report: MonitoringSignoffReport): string {
  return report.closingSummary;
}
