/**
 * V75 P6 — Agent simulation catalog entry (read-only)
 */
export {
  AGENT_SIMULATION_CATALOG_ENTRIES,
  AGENT_SIMULATION_VALIDATION_CATALOG,
  buildAgentSimulationCatalogManifest,
  buildAgentSimulationValidationManifest,
  computeAgentDeclarativeSimulationDeclared,
  getAgentSimulationCatalogEntriesByType,
  getAgentSimulationCatalogEntryById,
  getAgentSimulationValidationBySimulationRef,
  isAgentSimulationCatalogRefsAligned,
} from "./agent.simulation.catalog";
export {
  assertAgentSimulationCatalogPass,
  buildAgentSimulationCatalog,
} from "./agent.simulation.builder";
export {
  V75_AGENT_SIMULATION_FREEZE_VERSION,
  V75_AGENT_SIMULATION_VERSION,
} from "./agent.simulation";
export type {
  AgentSimulationCatalogEntry,
  AgentSimulationCatalogReport,
  AgentSimulationCatalogSignals,
  AgentSimulationPriority,
  AgentSimulationTypeKind,
  AgentSimulationValidation,
} from "./agent.simulation";

import { buildAgentSimulationCatalog } from "./agent.simulation.builder";
import type {
  AgentSimulationCatalogReport,
  AgentSimulationCatalogSignals,
} from "./agent.simulation";

export function runAgentSimulationCatalog(input?: {
  deploymentId?: string;
  signals?: AgentSimulationCatalogSignals;
}): AgentSimulationCatalogReport {
  return buildAgentSimulationCatalog(input);
}

export function formatAgentSimulationCatalogSummary(
  report: AgentSimulationCatalogReport,
): string {
  const lines = [
    "V75 Agent Simulation Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  agent-evaluation-catalog: ${report.agentEvaluationCatalogVersion} (ready=${report.agentEvaluationCatalogReady})`,
    `  simulations: ${report.catalog.entryCount}`,
    `  types: ${report.catalog.typeCount}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
