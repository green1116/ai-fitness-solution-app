/**
 * V75 P4 — Agent constraint catalog entry (read-only)
 */
export {
  AGENT_CONSTRAINT_CATALOG_ENTRIES,
  AGENT_CONSTRAINT_VALIDATION_CATALOG,
  buildAgentConstraintCatalogManifest,
  buildAgentConstraintValidationManifest,
  computeAgentDeclarativeConstraintBlock,
  getAgentConstraintCatalogEntriesByType,
  getAgentConstraintCatalogEntryById,
  getAgentConstraintValidationByConstraintRef,
  isAgentConstraintCatalogRefsAligned,
} from "./agent.constraint.catalog";
export {
  assertAgentConstraintCatalogPass,
  buildAgentConstraintCatalog,
} from "./agent.constraint.builder";
export {
  V75_AGENT_CONSTRAINT_FREEZE_VERSION,
  V75_AGENT_CONSTRAINT_VERSION,
} from "./agent.constraint";
export type {
  AgentConstraintCatalogEntry,
  AgentConstraintCatalogReport,
  AgentConstraintCatalogSignals,
  AgentConstraintLevel,
  AgentConstraintPriority,
  AgentConstraintTypeKind,
  AgentConstraintValidation,
} from "./agent.constraint";

import { buildAgentConstraintCatalog } from "./agent.constraint.builder";
import type {
  AgentConstraintCatalogReport,
  AgentConstraintCatalogSignals,
} from "./agent.constraint";

export function runAgentConstraintCatalog(input?: {
  deploymentId?: string;
  signals?: AgentConstraintCatalogSignals;
}): AgentConstraintCatalogReport {
  return buildAgentConstraintCatalog(input);
}

export function formatAgentConstraintCatalogSummary(
  report: AgentConstraintCatalogReport,
): string {
  const lines = [
    "V75 Agent Constraint Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  agent-context-catalog: ${report.agentContextCatalogVersion} (ready=${report.agentContextCatalogReady})`,
    `  constraints: ${report.catalog.entryCount}`,
    `  types: ${report.catalog.typeCount}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
