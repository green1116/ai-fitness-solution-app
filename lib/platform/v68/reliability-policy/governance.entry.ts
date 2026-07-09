/**
 * V68 P6 — Reliability policy entry (read-only)
 */
import { buildReliabilityPolicyReport } from "./governance.builder";
import type { ReliabilityPolicyReport, ReliabilityPolicySignals } from "./governance.types";

export type { ReliabilityPolicySignals };

export function runReliabilityPolicy(input?: {
  deploymentId?: string;
  signals?: ReliabilityPolicySignals;
}): ReliabilityPolicyReport {
  return buildReliabilityPolicyReport(input);
}

export function formatReliabilityPolicySummary(report: ReliabilityPolicyReport): string {
  const lines = [
    "V68 Reliability Policy",
    `  ready: ${report.policyReady}`,
    `  score: ${report.readinessScore}/100`,
    `  capacity-planning: ${report.capacityPlanningVersion} (ready=${report.capacityPlanningReady})`,
    `  objectives: ${report.objectives.entryCount}`,
    `  failure severities: ${report.failureSeverities.entryCount}`,
    `  degradation strategies: ${report.degradationStrategies.entryCount}`,
    `  recovery strategies: ${report.recoveryStrategies.entryCount}`,
  ];
  return lines.join("\n");
}
