/**
 * V75 P7 — Agent compliance catalog entry (read-only)
 */
export {
  AGENT_COMPLIANCE_CATALOG_ENTRIES,
  AGENT_COMPLIANCE_VALIDATION_CATALOG,
  buildAgentComplianceCatalogManifest,
  buildAgentComplianceValidationManifest,
  computeAgentDeclarativeCompliancePass,
  getAgentComplianceCatalogEntriesByDomain,
  getAgentComplianceCatalogEntryById,
  getAgentComplianceValidationByComplianceRef,
  isAgentComplianceCatalogRefsAligned,
} from "./agent.compliance.catalog";
export {
  assertAgentComplianceCatalogPass,
  buildAgentComplianceCatalog,
} from "./agent.compliance.builder";
export {
  V75_AGENT_COMPLIANCE_FREEZE_VERSION,
  V75_AGENT_COMPLIANCE_VERSION,
} from "./agent.compliance";
export type {
  AgentComplianceCatalogEntry,
  AgentComplianceCatalogReport,
  AgentComplianceCatalogSignals,
  AgentComplianceDomainKind,
  AgentComplianceStatus,
  AgentComplianceValidation,
} from "./agent.compliance";

import { buildAgentComplianceCatalog } from "./agent.compliance.builder";
import type {
  AgentComplianceCatalogReport,
  AgentComplianceCatalogSignals,
} from "./agent.compliance";

export function runAgentComplianceCatalog(input?: {
  deploymentId?: string;
  signals?: AgentComplianceCatalogSignals;
}): AgentComplianceCatalogReport {
  return buildAgentComplianceCatalog(input);
}

export function formatAgentComplianceCatalogSummary(
  report: AgentComplianceCatalogReport,
): string {
  const passed = report.catalog.items.filter(
    (i) => i.status === "passed" || i.status === "waived",
  ).length;
  const lines = [
    "V75 Agent Compliance Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  agent-simulation-catalog: ${report.agentSimulationCatalogVersion} (ready=${report.agentSimulationCatalogReady})`,
    `  items: ${report.catalog.entryCount}`,
    `  domains: ${report.catalog.domainCount}`,
    `  passed: ${passed}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
