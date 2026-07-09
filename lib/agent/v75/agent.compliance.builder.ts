/**
 * V75 P7 — Agent compliance catalog builder (read-only)
 */
import { buildAgentSimulationCatalog } from "./agent.simulation.builder";
import { V75_AGENT_SIMULATION_VERSION } from "./agent.simulation";
import {
  buildAgentComplianceCatalogManifest,
  buildAgentComplianceValidationManifest,
  isAgentComplianceCatalogRefsAligned,
} from "./agent.compliance.catalog";
import type {
  AgentComplianceCatalogReport,
  AgentComplianceCatalogSignals,
} from "./agent.compliance";
import {
  V75_AGENT_COMPLIANCE_FREEZE_VERSION,
  V75_AGENT_COMPLIANCE_VERSION,
} from "./agent.compliance";

const DEFAULT_SIGNALS: AgentComplianceCatalogSignals = {
  agentSimulationCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildAgentComplianceCatalog(input?: {
  deploymentId?: string;
  signals?: AgentComplianceCatalogSignals;
}): AgentComplianceCatalogReport {
  const deploymentId = input?.deploymentId ?? "v75-agent-compliance-catalog-default";

  const agentSimulationCatalog = buildAgentSimulationCatalog({ deploymentId });
  const catalog = buildAgentComplianceCatalogManifest();
  const validations = buildAgentComplianceValidationManifest();
  const refsAligned = isAgentComplianceCatalogRefsAligned();

  const signals: AgentComplianceCatalogSignals = {
    ...DEFAULT_SIGNALS,
    agentSimulationCatalogReady: agentSimulationCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V75_AGENT_COMPLIANCE_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    agentSimulationCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.agentSimulationCatalogReady !== false;

  return {
    version: V75_AGENT_COMPLIANCE_VERSION,
    freezeVersion: V75_AGENT_COMPLIANCE_FREEZE_VERSION,
    reportId: `agent-compliance-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    agentSimulationCatalogVersion: V75_AGENT_SIMULATION_VERSION,
    agentSimulationCatalogReady: agentSimulationCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `agent-compliance-catalog ready=${catalogReady}`,
      `items=${catalog.entryCount}`,
      `domains=${catalog.domainCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `simulationCatalog=${agentSimulationCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertAgentComplianceCatalogPass(
  report: AgentComplianceCatalogReport,
): asserts report is AgentComplianceCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V75 agent compliance catalog not ready: ${report.summary}`);
  }
}
