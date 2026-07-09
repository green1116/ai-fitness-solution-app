/**
 * V67 P5 — On-call governance entry (read-only)
 */
import { buildOncallGovernanceReport } from "./governance.builder";
import type { OncallGovernanceReport, OncallGovernanceSignals } from "./governance.types";

export type { OncallGovernanceSignals };

export function runOncallGovernance(input?: {
  deploymentId?: string;
  signals?: OncallGovernanceSignals;
}): OncallGovernanceReport {
  return buildOncallGovernanceReport(input);
}

export function formatOncallGovernanceSummary(report: OncallGovernanceReport): string {
  const lines = [
    "V67 On-call & Escalation Governance",
    `  ready: ${report.governanceReady}`,
    `  score: ${report.readinessScore}/100`,
    `  slo-governance: ${report.sloGovernanceVersion} (ready=${report.sloGovernanceReady})`,
    `  roster: ${report.roster.entryCount}`,
    `  escalation policies: ${report.escalationPolicy.policyCount}`,
    `  response targets: ${report.responseTargets.targetCount}`,
    `  handoff rules: ${report.handoffContract.ruleCount}`,
  ];
  return lines.join("\n");
}
