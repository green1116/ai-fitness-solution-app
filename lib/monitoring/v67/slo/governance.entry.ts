/**
 * V67 P4 — SLO governance entry (read-only)
 */
import { buildSloGovernanceReport } from "./governance.builder";
import type { SloGovernanceReport, SloGovernanceSignals } from "./governance.types";

export type { SloGovernanceSignals };

export function runSloGovernance(input?: {
  deploymentId?: string;
  signals?: SloGovernanceSignals;
}): SloGovernanceReport {
  return buildSloGovernanceReport(input);
}

export function formatSloGovernanceSummary(report: SloGovernanceReport): string {
  const lines = [
    "V67 SLO/SLI Governance",
    `  ready: ${report.governanceReady}`,
    `  score: ${report.readinessScore}/100`,
    `  taxonomy: ${report.taxonomyVersion} (ready=${report.taxonomyReady})`,
    `  SLI types: ${report.sliTypes.typeCount}`,
    `  SLO types: ${report.sloTypes.typeCount}`,
    `  objectives: ${report.objectiveCatalog.entryCount}`,
    `  error budgets: ${report.budgetContract.ruleCount}`,
  ];
  return lines.join("\n");
}
