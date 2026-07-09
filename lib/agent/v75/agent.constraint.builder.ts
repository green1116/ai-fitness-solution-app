/**
 * V75 P4 — Agent constraint catalog builder (read-only)
 */
import { buildAgentContextCatalog } from "./agent.context.builder";
import { V75_AGENT_CONTEXT_VERSION } from "./agent.context";
import {
  buildAgentConstraintCatalogManifest,
  buildAgentConstraintValidationManifest,
  isAgentConstraintCatalogRefsAligned,
} from "./agent.constraint.catalog";
import type {
  AgentConstraintCatalogReport,
  AgentConstraintCatalogSignals,
} from "./agent.constraint";
import {
  V75_AGENT_CONSTRAINT_FREEZE_VERSION,
  V75_AGENT_CONSTRAINT_VERSION,
} from "./agent.constraint";

const DEFAULT_SIGNALS: AgentConstraintCatalogSignals = {
  agentContextCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildAgentConstraintCatalog(input?: {
  deploymentId?: string;
  signals?: AgentConstraintCatalogSignals;
}): AgentConstraintCatalogReport {
  const deploymentId = input?.deploymentId ?? "v75-agent-constraint-catalog-default";

  const agentContextCatalog = buildAgentContextCatalog({ deploymentId });
  const catalog = buildAgentConstraintCatalogManifest();
  const validations = buildAgentConstraintValidationManifest();
  const refsAligned = isAgentConstraintCatalogRefsAligned();

  const signals: AgentConstraintCatalogSignals = {
    ...DEFAULT_SIGNALS,
    agentContextCatalogReady: agentContextCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V75_AGENT_CONSTRAINT_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    agentContextCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.agentContextCatalogReady !== false;

  return {
    version: V75_AGENT_CONSTRAINT_VERSION,
    freezeVersion: V75_AGENT_CONSTRAINT_FREEZE_VERSION,
    reportId: `agent-constraint-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    agentContextCatalogVersion: V75_AGENT_CONTEXT_VERSION,
    agentContextCatalogReady: agentContextCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `agent-constraint-catalog ready=${catalogReady}`,
      `constraints=${catalog.entryCount}`,
      `types=${catalog.typeCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `contextCatalog=${agentContextCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertAgentConstraintCatalogPass(
  report: AgentConstraintCatalogReport,
): asserts report is AgentConstraintCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V75 agent constraint catalog not ready: ${report.summary}`);
  }
}
