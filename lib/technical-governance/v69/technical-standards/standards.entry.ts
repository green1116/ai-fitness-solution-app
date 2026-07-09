/**
 * V69 P4 — Technical standards entry (read-only)
 */
import { buildTechnicalStandardsReport } from "./standards.builder";
import type { TechnicalStandardsReport, TechnicalStandardsSignals } from "./standards.types";

export type { TechnicalStandardsSignals };

export function runTechnicalStandards(input?: {
  deploymentId?: string;
  signals?: TechnicalStandardsSignals;
}): TechnicalStandardsReport {
  return buildTechnicalStandardsReport(input);
}

export function formatTechnicalStandardsSummary(report: TechnicalStandardsReport): string {
  const lines = [
    "V69 Technical Standards",
    `  ready: ${report.standardsReady}`,
    `  score: ${report.readinessScore}/100`,
    `  code-governance: ${report.codeGovernanceVersion} (ready=${report.codeGovernanceReady})`,
    `  policy set: ${report.policySet.entryCount}`,
    `  naming: ${report.naming.entryCount}`,
    `  versioning: ${report.versioning.entryCount}`,
    `  interfaces: ${report.interfaces.entryCount}`,
    `  directories: ${report.directories.entryCount}`,
    `  changes: ${report.changes.entryCount}`,
    `  registry total: ${report.registry.totalEntries}`,
  ];
  return lines.join("\n");
}
