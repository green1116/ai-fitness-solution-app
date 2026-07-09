/**
 * V75 P5 — Agent evaluation catalog builder (read-only)
 */
import { buildAgentConstraintCatalog } from "./agent.constraint.builder";
import { V75_AGENT_CONSTRAINT_VERSION } from "./agent.constraint";
import {
  buildAgentEvaluationCatalogManifest,
  buildAgentEvaluationValidationManifest,
  isAgentEvaluationCatalogRefsAligned,
} from "./agent.evaluation.catalog";
import type {
  AgentEvaluationCatalogReport,
  AgentEvaluationCatalogSignals,
} from "./agent.evaluation";
import {
  V75_AGENT_EVALUATION_FREEZE_VERSION,
  V75_AGENT_EVALUATION_VERSION,
} from "./agent.evaluation";

const DEFAULT_SIGNALS: AgentEvaluationCatalogSignals = {
  agentConstraintCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildAgentEvaluationCatalog(input?: {
  deploymentId?: string;
  signals?: AgentEvaluationCatalogSignals;
}): AgentEvaluationCatalogReport {
  const deploymentId = input?.deploymentId ?? "v75-agent-evaluation-catalog-default";

  const agentConstraintCatalog = buildAgentConstraintCatalog({ deploymentId });
  const catalog = buildAgentEvaluationCatalogManifest();
  const validations = buildAgentEvaluationValidationManifest();
  const refsAligned = isAgentEvaluationCatalogRefsAligned();

  const signals: AgentEvaluationCatalogSignals = {
    ...DEFAULT_SIGNALS,
    agentConstraintCatalogReady: agentConstraintCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V75_AGENT_EVALUATION_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    agentConstraintCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.agentConstraintCatalogReady !== false;

  return {
    version: V75_AGENT_EVALUATION_VERSION,
    freezeVersion: V75_AGENT_EVALUATION_FREEZE_VERSION,
    reportId: `agent-evaluation-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    agentConstraintCatalogVersion: V75_AGENT_CONSTRAINT_VERSION,
    agentConstraintCatalogReady: agentConstraintCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `agent-evaluation-catalog ready=${catalogReady}`,
      `evaluations=${catalog.entryCount}`,
      `dimensions=${catalog.dimensionCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `constraintCatalog=${agentConstraintCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertAgentEvaluationCatalogPass(
  report: AgentEvaluationCatalogReport,
): asserts report is AgentEvaluationCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V75 agent evaluation catalog not ready: ${report.summary}`);
  }
}
