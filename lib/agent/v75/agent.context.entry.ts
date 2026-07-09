/**
 * V75 P3 — Agent context catalog entry (read-only)
 */
export {
  AGENT_CONTEXT_CATALOG_ENTRIES,
  AGENT_CONTEXT_VALIDATION_CATALOG,
  buildAgentContextCatalogManifest,
  buildAgentContextValidationManifest,
  computeAgentDeclarativeContextValid,
  getAgentContextCatalogEntriesByDomain,
  getAgentContextCatalogEntryById,
  getAgentContextValidationByContextRef,
  isAgentContextCatalogRefsAligned,
} from "./agent.context.catalog";
export {
  assertAgentContextCatalogPass,
  buildAgentContextCatalog,
} from "./agent.context.builder";
export {
  V75_AGENT_CONTEXT_FREEZE_VERSION,
  V75_AGENT_CONTEXT_VERSION,
} from "./agent.context";
export type {
  AgentContextCatalogEntry,
  AgentContextCatalogReport,
  AgentContextCatalogSignals,
  AgentContextDomainKind,
  AgentContextLifecycle,
  AgentContextPriority,
  AgentContextValidation,
} from "./agent.context";

import { buildAgentContextCatalog } from "./agent.context.builder";
import type {
  AgentContextCatalogReport,
  AgentContextCatalogSignals,
} from "./agent.context";

export function runAgentContextCatalog(input?: {
  deploymentId?: string;
  signals?: AgentContextCatalogSignals;
}): AgentContextCatalogReport {
  return buildAgentContextCatalog(input);
}

export function formatAgentContextCatalogSummary(report: AgentContextCatalogReport): string {
  const lines = [
    "V75 Agent Context Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  agent-policy-catalog: ${report.agentPolicyCatalogVersion} (ready=${report.agentPolicyCatalogReady})`,
    `  contexts: ${report.catalog.entryCount}`,
    `  domains: ${report.catalog.domainCount}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
