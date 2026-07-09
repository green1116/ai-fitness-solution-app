/**
 * V69 P5 — Security governance entry (read-only)
 */
import { buildSecurityGovernanceReport } from "./governance.builder";
import type { SecurityGovernanceReport, SecurityGovernanceSignals } from "./governance.types";

export type { SecurityGovernanceSignals };

export function runSecurityGovernance(input?: {
  deploymentId?: string;
  signals?: SecurityGovernanceSignals;
}): SecurityGovernanceReport {
  return buildSecurityGovernanceReport(input);
}

export function formatSecurityGovernanceSummary(report: SecurityGovernanceReport): string {
  const lines = [
    "V69 Security Governance",
    `  ready: ${report.governanceReady}`,
    `  score: ${report.readinessScore}/100`,
    `  technical-standards: ${report.technicalStandardsVersion} (ready=${report.technicalStandardsReady})`,
    `  objects: ${report.objects.entryCount}`,
    `  policies: ${report.policies.policyCount}`,
    `  boundaries: ${report.boundaries.boundaryCount}`,
    `  sensitive surfaces: ${report.sensitiveSurfaces.surfaceCount}`,
    `  access standards: ${report.accessStandards.entryCount}`,
    `  permission standards: ${report.permissionStandards.entryCount}`,
    `  audit standards: ${report.auditStandards.entryCount}`,
    `  risk controls: ${report.riskControls.entryCount}`,
    `  registry total: ${report.registry.totalEntries}`,
  ];
  return lines.join("\n");
}
