/**
 * V69 P7 — Architecture compliance entry (read-only)
 */
import { buildArchitectureComplianceReport } from "./compliance.builder";
import type {
  ArchitectureComplianceReport,
  ArchitectureComplianceSignals,
} from "./compliance.types";

export type { ArchitectureComplianceSignals };

export function runArchitectureCompliance(input?: {
  deploymentId?: string;
  signals?: ArchitectureComplianceSignals;
}): ArchitectureComplianceReport {
  return buildArchitectureComplianceReport(input);
}

export function formatArchitectureComplianceSummary(
  report: ArchitectureComplianceReport,
): string {
  const lines = [
    "V69 Architecture Compliance",
    `  ready: ${report.complianceReady}`,
    `  score: ${report.readinessScore}/100`,
    `  quality-governance: ${report.qualityGovernanceVersion} (ready=${report.qualityGovernanceReady})`,
    `  objects: ${report.objects.entryCount}`,
    `  rules: ${report.rules.entryCount}`,
    `  checks: ${report.checks.entryCount}`,
    `  gates: ${report.gates.gateCount}`,
    `  alignment checks: ${report.alignmentChecks.entryCount}`,
    `  deviations: ${report.deviations.entryCount}`,
    `  exceptions: ${report.exceptions.entryCount}`,
    `  registry total: ${report.registry.totalEntries}`,
  ];
  return lines.join("\n");
}
