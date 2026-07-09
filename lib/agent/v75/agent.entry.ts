/**
 * V75 P1 — Agent inventory entry (read-only)
 */
export {
  AGENT_CONSTRAINT_CATALOG,
  AGENT_CONTEXT_CATALOG,
  AGENT_INPUT_CATALOG,
  AGENT_OUTPUT_CATALOG,
  AGENT_POLICY_CATALOG,
  AGENT_SOURCE_CATALOG,
  assertAgentInventoryPass,
  buildAgentConstraintManifest,
  buildAgentContextManifest,
  buildAgentInputManifest,
  buildAgentInventory,
  buildAgentInventoryManifest,
  buildAgentOutputManifest,
  buildAgentPolicyManifest,
  buildAgentSourceManifest,
  getAgentInputById,
  getAgentOutputById,
  getAgentPolicyById,
  getAgentSourceById,
  isAgentInventoryRefsAligned,
} from "./agent.inventory";
export {
  AGENT_UPSTREAM_DEPENDENCIES,
  getAgentDependenciesByDecisionRef,
  getAgentDependencyById,
  isAgentUpstreamAligned,
} from "./agent.dependencies";
export {
  AGENT_SCOPE_CATALOG,
  buildAgentScopeManifest,
  getAgentScopeById,
  getAgentScopesByKind,
  isAgentScopeCoverageComplete,
} from "./agent.scope";
export { V75_AGENT_FREEZE_VERSION, V75_AGENT_VERSION } from "./agent.types";
export type {
  AgentAssetStatus,
  AgentConstraint,
  AgentContext,
  AgentInput,
  AgentInventoryManifest,
  AgentInventoryReport,
  AgentInventorySignals,
  AgentOutput,
  AgentPolicy,
  AgentSource,
} from "./agent.types";
export type { AgentUpstreamDependency } from "./agent.dependencies";
export type { AgentScope, AgentScopeKind } from "./agent.scope";

import { buildAgentInventory } from "./agent.inventory";
import type { AgentInventoryReport, AgentInventorySignals } from "./agent.types";

export function runAgentInventory(input?: {
  deploymentId?: string;
  signals?: AgentInventorySignals;
}): AgentInventoryReport {
  return buildAgentInventory(input);
}

export function formatAgentInventorySummary(report: AgentInventoryReport): string {
  const lines = [
    "V75 Agent Inventory",
    `  ready: ${report.inventoryReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  upstream-decision-freeze: ${report.upstreamDecisionFreeze}`,
    `  inputs: ${report.manifest.inputs.entryCount}`,
    `  outputs: ${report.manifest.outputs.entryCount}`,
    `  contexts: ${report.manifest.contexts.entryCount}`,
    `  constraints: ${report.manifest.constraints.entryCount}`,
    `  policies: ${report.manifest.policies.entryCount}`,
    `  sources: ${report.manifest.sources.entryCount}`,
  ];
  return lines.join("\n");
}
