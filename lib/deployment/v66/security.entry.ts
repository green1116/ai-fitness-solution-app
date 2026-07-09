/**
 * V66 P5 — Deployment security entry (read-only)
 */
import { buildDeploymentSecurityReport } from "./security.builder";
import type { DeploymentSecurityReport, DeploymentSecuritySignals } from "./security.types";

export type { DeploymentSecuritySignals };

export function runDeploymentSecurity(input?: {
  deploymentId?: string;
  signals?: DeploymentSecuritySignals;
}): DeploymentSecurityReport {
  return buildDeploymentSecurityReport(input);
}

export function formatDeploymentSecuritySummary(report: DeploymentSecurityReport): string {
  const lines = [
    "V66 Deployment Security & Compliance",
    `  ready: ${report.securityReady}`,
    `  score: ${report.readinessScore}/100`,
    `  orchestration: ${report.orchestrationVersion} (ready=${report.orchestrationReady})`,
    `  security policies: ${report.securityPolicies.policyCount}`,
    `  compliance: ${report.complianceChecklist.passCount}/${report.complianceChecklist.itemCount}`,
    `  security gates: ${report.securityGates.closedCount}/${report.securityGates.gateCount}`,
    `  artifact integrity: ${report.artifactIntegrity.entryCount}`,
  ];
  return lines.join("\n");
}
