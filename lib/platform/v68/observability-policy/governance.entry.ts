/**
 * V68 P7 — Observability policy entry (read-only)
 */
import { buildObservabilityPolicyReport } from "./governance.builder";
import type { ObservabilityPolicyReport, ObservabilityPolicySignals } from "./governance.types";

export type { ObservabilityPolicySignals };

export function runObservabilityPolicy(input?: {
  deploymentId?: string;
  signals?: ObservabilityPolicySignals;
}): ObservabilityPolicyReport {
  return buildObservabilityPolicyReport(input);
}

export function formatObservabilityPolicySummary(report: ObservabilityPolicyReport): string {
  const lines = [
    "V68 Observability Policy",
    `  ready: ${report.policyReady}`,
    `  score: ${report.readinessScore}/100`,
    `  reliability-policy: ${report.reliabilityPolicyVersion} (ready=${report.reliabilityPolicyReady})`,
    `  metrics: ${report.metrics.entryCount}`,
    `  logs: ${report.logs.entryCount}`,
    `  traces: ${report.traces.entryCount}`,
    `  alert mappings: ${report.alertMappings.entryCount}`,
  ];
  return lines.join("\n");
}
