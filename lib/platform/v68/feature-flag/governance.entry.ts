/**
 * V68 P4 — Feature flag governance entry (read-only)
 */
import { buildFeatureFlagGovernanceReport } from "./governance.builder";
import type {
  FeatureFlagGovernanceReport,
  FeatureFlagGovernanceSignals,
} from "./governance.types";

export type { FeatureFlagGovernanceSignals };

export function runFeatureFlagGovernance(input?: {
  deploymentId?: string;
  signals?: FeatureFlagGovernanceSignals;
}): FeatureFlagGovernanceReport {
  return buildFeatureFlagGovernanceReport(input);
}

export function formatFeatureFlagGovernanceSummary(report: FeatureFlagGovernanceReport): string {
  const lines = [
    "V68 Feature Flag Governance",
    `  ready: ${report.governanceReady}`,
    `  score: ${report.readinessScore}/100`,
    `  configuration: ${report.configurationGovernanceVersion} (ready=${report.configurationGovernanceReady})`,
    `  flag definitions: ${report.flagDefinitions.flagCount}`,
    `  flag states: ${report.flagStates.entryCount}`,
    `  flag scopes: ${report.flagScopes.entryCount}`,
    `  toggle rules: ${report.toggleContract.ruleCount}`,
  ];
  return lines.join("\n");
}
