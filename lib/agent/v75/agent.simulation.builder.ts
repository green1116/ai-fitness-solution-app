/**
 * V75 P6 — Agent simulation catalog builder (read-only)
 */
import { buildAgentEvaluationCatalog } from "./agent.evaluation.builder";
import { V75_AGENT_EVALUATION_VERSION } from "./agent.evaluation";
import {
  buildAgentSimulationCatalogManifest,
  buildAgentSimulationValidationManifest,
  isAgentSimulationCatalogRefsAligned,
} from "./agent.simulation.catalog";
import type {
  AgentSimulationCatalogReport,
  AgentSimulationCatalogSignals,
} from "./agent.simulation";
import {
  V75_AGENT_SIMULATION_FREEZE_VERSION,
  V75_AGENT_SIMULATION_VERSION,
} from "./agent.simulation";

const DEFAULT_SIGNALS: AgentSimulationCatalogSignals = {
  agentEvaluationCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildAgentSimulationCatalog(input?: {
  deploymentId?: string;
  signals?: AgentSimulationCatalogSignals;
}): AgentSimulationCatalogReport {
  const deploymentId = input?.deploymentId ?? "v75-agent-simulation-catalog-default";

  const agentEvaluationCatalog = buildAgentEvaluationCatalog({ deploymentId });
  const catalog = buildAgentSimulationCatalogManifest();
  const validations = buildAgentSimulationValidationManifest();
  const refsAligned = isAgentSimulationCatalogRefsAligned();

  const signals: AgentSimulationCatalogSignals = {
    ...DEFAULT_SIGNALS,
    agentEvaluationCatalogReady: agentEvaluationCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V75_AGENT_SIMULATION_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    agentEvaluationCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.agentEvaluationCatalogReady !== false;

  return {
    version: V75_AGENT_SIMULATION_VERSION,
    freezeVersion: V75_AGENT_SIMULATION_FREEZE_VERSION,
    reportId: `agent-simulation-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    agentEvaluationCatalogVersion: V75_AGENT_EVALUATION_VERSION,
    agentEvaluationCatalogReady: agentEvaluationCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `agent-simulation-catalog ready=${catalogReady}`,
      `simulations=${catalog.entryCount}`,
      `types=${catalog.typeCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `evaluationCatalog=${agentEvaluationCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertAgentSimulationCatalogPass(
  report: AgentSimulationCatalogReport,
): asserts report is AgentSimulationCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V75 agent simulation catalog not ready: ${report.summary}`);
  }
}
