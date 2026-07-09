/**
 * V69 P6 — Quality governance entry (read-only)
 */
import { buildQualityGovernanceReport } from "./governance.builder";
import type { QualityGovernanceReport, QualityGovernanceSignals } from "./governance.types";

export type { QualityGovernanceSignals };

export function runQualityGovernance(input?: {
  deploymentId?: string;
  signals?: QualityGovernanceSignals;
}): QualityGovernanceReport {
  return buildQualityGovernanceReport(input);
}

export function formatQualityGovernanceSummary(report: QualityGovernanceReport): string {
  const lines = [
    "V69 Quality Governance",
    `  ready: ${report.governanceReady}`,
    `  score: ${report.readinessScore}/100`,
    `  security-governance: ${report.securityGovernanceVersion} (ready=${report.securityGovernanceReady})`,
    `  objects: ${report.objects.entryCount}`,
    `  standards: ${report.standards.entryCount}`,
    `  gates: ${report.gates.gateCount}`,
    `  test standards: ${report.testStandards.entryCount}`,
    `  acceptance rules: ${report.acceptanceRules.entryCount}`,
    `  defect controls: ${report.defectControls.entryCount}`,
    `  release quality: ${report.releaseQuality.entryCount}`,
    `  registry total: ${report.registry.totalEntries}`,
  ];
  return lines.join("\n");
}
