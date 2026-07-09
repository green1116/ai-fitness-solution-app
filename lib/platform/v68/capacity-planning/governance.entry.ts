/**
 * V68 P5 — Capacity planning entry (read-only)
 */
import { buildCapacityPlanningReport } from "./governance.builder";
import type { CapacityPlanningReport, CapacityPlanningSignals } from "./governance.types";

export type { CapacityPlanningSignals };

export function runCapacityPlanning(input?: {
  deploymentId?: string;
  signals?: CapacityPlanningSignals;
}): CapacityPlanningReport {
  return buildCapacityPlanningReport(input);
}

export function formatCapacityPlanningSummary(report: CapacityPlanningReport): string {
  const lines = [
    "V68 Capacity Planning",
    `  ready: ${report.planningReady}`,
    `  score: ${report.readinessScore}/100`,
    `  feature-flags: ${report.featureFlagGovernanceVersion} (ready=${report.featureFlagGovernanceReady})`,
    `  baselines: ${report.baselines.entryCount}`,
    `  thresholds: ${report.thresholds.entryCount}`,
    `  resource limits: ${report.resourceLimits.entryCount}`,
    `  stress risks: ${report.stressRisks.entryCount}`,
  ];
  return lines.join("\n");
}
