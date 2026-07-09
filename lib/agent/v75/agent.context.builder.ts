/**
 * V75 P3 — Agent context catalog builder (read-only)
 */
import { buildAgentPolicyCatalog } from "./agent.policy.builder";
import { V75_AGENT_POLICY_VERSION } from "./agent.policy";
import {
  buildAgentContextCatalogManifest,
  buildAgentContextValidationManifest,
  isAgentContextCatalogRefsAligned,
} from "./agent.context.catalog";
import type {
  AgentContextCatalogReport,
  AgentContextCatalogSignals,
} from "./agent.context";
import {
  V75_AGENT_CONTEXT_FREEZE_VERSION,
  V75_AGENT_CONTEXT_VERSION,
} from "./agent.context";

const DEFAULT_SIGNALS: AgentContextCatalogSignals = {
  agentPolicyCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildAgentContextCatalog(input?: {
  deploymentId?: string;
  signals?: AgentContextCatalogSignals;
}): AgentContextCatalogReport {
  const deploymentId = input?.deploymentId ?? "v75-agent-context-catalog-default";

  const agentPolicyCatalog = buildAgentPolicyCatalog({ deploymentId });
  const catalog = buildAgentContextCatalogManifest();
  const validations = buildAgentContextValidationManifest();
  const refsAligned = isAgentContextCatalogRefsAligned();

  const signals: AgentContextCatalogSignals = {
    ...DEFAULT_SIGNALS,
    agentPolicyCatalogReady: agentPolicyCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V75_AGENT_CONTEXT_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    agentPolicyCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.agentPolicyCatalogReady !== false;

  return {
    version: V75_AGENT_CONTEXT_VERSION,
    freezeVersion: V75_AGENT_CONTEXT_FREEZE_VERSION,
    reportId: `agent-context-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    agentPolicyCatalogVersion: V75_AGENT_POLICY_VERSION,
    agentPolicyCatalogReady: agentPolicyCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `agent-context-catalog ready=${catalogReady}`,
      `contexts=${catalog.entryCount}`,
      `domains=${catalog.domainCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `policyCatalog=${agentPolicyCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertAgentContextCatalogPass(
  report: AgentContextCatalogReport,
): asserts report is AgentContextCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V75 agent context catalog not ready: ${report.summary}`);
  }
}
