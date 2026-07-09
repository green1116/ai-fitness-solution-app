/**
 * V69 P3 — Code governance entry (read-only)
 */
import { buildCodeGovernanceReport } from "./governance.builder";
import type { CodeGovernanceReport, CodeGovernanceSignals } from "./governance.types";

export type { CodeGovernanceSignals };

export function runCodeGovernance(input?: {
  deploymentId?: string;
  signals?: CodeGovernanceSignals;
}): CodeGovernanceReport {
  return buildCodeGovernanceReport(input);
}

export function formatCodeGovernanceSummary(report: CodeGovernanceReport): string {
  const lines = [
    "V69 Code Governance",
    `  ready: ${report.governanceReady}`,
    `  score: ${report.readinessScore}/100`,
    `  architecture-dependency: ${report.architectureDependencyVersion} (ready=${report.architectureDependencyReady})`,
    `  objects: ${report.objects.entryCount}`,
    `  policies: ${report.policies.policyCount}`,
    `  boundaries: ${report.boundaries.boundaryCount}`,
    `  ownerships: ${report.ownerships.ownershipCount}`,
    `  import allowances: ${report.importAllowances.allowanceCount}`,
    `  registry total: ${report.registry.totalEntries}`,
  ];
  return lines.join("\n");
}
