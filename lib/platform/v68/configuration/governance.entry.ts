/**
 * V68 P3 — Configuration governance entry (read-only)
 */
import { buildConfigurationGovernanceReport } from "./governance.builder";
import type {
  ConfigurationGovernanceReport,
  ConfigurationGovernanceSignals,
} from "./governance.types";

export type { ConfigurationGovernanceSignals };

export function runConfigurationGovernance(input?: {
  deploymentId?: string;
  signals?: ConfigurationGovernanceSignals;
}): ConfigurationGovernanceReport {
  return buildConfigurationGovernanceReport(input);
}

export function formatConfigurationGovernanceSummary(
  report: ConfigurationGovernanceReport,
): string {
  const lines = [
    "V68 Configuration Governance",
    `  ready: ${report.governanceReady}`,
    `  score: ${report.readinessScore}/100`,
    `  dependency-graph: ${report.dependencyGraphVersion} (ready=${report.dependencyGraphReady})`,
    `  config items: ${report.configItems.itemCount}`,
    `  config sources: ${report.configSources.sourceCount}`,
    `  validity rules: ${report.configValidity.ruleCount}`,
    `  alignment: ${report.configAlignment.alignedCount}/${report.configAlignment.entryCount}`,
  ];
  return lines.join("\n");
}
