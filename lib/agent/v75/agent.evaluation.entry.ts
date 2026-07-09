/**
 * V75 P5 — Agent evaluation catalog entry (read-only)
 */
export {
  AGENT_EVALUATION_CATALOG_ENTRIES,
  AGENT_EVALUATION_VALIDATION_CATALOG,
  buildAgentEvaluationCatalogManifest,
  buildAgentEvaluationValidationManifest,
  computeAgentDeclarativeEvaluationDeclared,
  getAgentEvaluationCatalogEntriesByDimension,
  getAgentEvaluationCatalogEntryById,
  getAgentEvaluationValidationByEvaluationRef,
  isAgentEvaluationCatalogRefsAligned,
} from "./agent.evaluation.catalog";
export {
  assertAgentEvaluationCatalogPass,
  buildAgentEvaluationCatalog,
} from "./agent.evaluation.builder";
export {
  V75_AGENT_EVALUATION_FREEZE_VERSION,
  V75_AGENT_EVALUATION_VERSION,
} from "./agent.evaluation";
export type {
  AgentEvaluationCatalogEntry,
  AgentEvaluationCatalogReport,
  AgentEvaluationCatalogSignals,
  AgentEvaluationDimensionKind,
  AgentEvaluationPriority,
  AgentEvaluationValidation,
} from "./agent.evaluation";

import { buildAgentEvaluationCatalog } from "./agent.evaluation.builder";
import type {
  AgentEvaluationCatalogReport,
  AgentEvaluationCatalogSignals,
} from "./agent.evaluation";

export function runAgentEvaluationCatalog(input?: {
  deploymentId?: string;
  signals?: AgentEvaluationCatalogSignals;
}): AgentEvaluationCatalogReport {
  return buildAgentEvaluationCatalog(input);
}

export function formatAgentEvaluationCatalogSummary(
  report: AgentEvaluationCatalogReport,
): string {
  const lines = [
    "V75 Agent Evaluation Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  agent-constraint-catalog: ${report.agentConstraintCatalogVersion} (ready=${report.agentConstraintCatalogReady})`,
    `  evaluations: ${report.catalog.entryCount}`,
    `  dimensions: ${report.catalog.dimensionCount}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
