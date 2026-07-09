/**
 * V75 P2 — Agent policy catalog entry (read-only)
 */
export {
  AGENT_POLICY_CATALOG_ENTRIES,
  AGENT_POLICY_GATE_CATALOG,
  buildAgentPolicyCatalogManifest,
  buildAgentPolicyGateManifest,
  computeAgentDeclarativePolicyBlock,
  getAgentPolicyCatalogEntriesByKind,
  getAgentPolicyCatalogEntryById,
  getAgentPolicyGateByPolicyRef,
  isAgentPolicyCatalogRefsAligned,
} from "./agent.policy.catalog";
export {
  assertAgentPolicyCatalogPass,
  buildAgentPolicyCatalog,
} from "./agent.policy.builder";
export {
  V75_AGENT_POLICY_FREEZE_VERSION,
  V75_AGENT_POLICY_VERSION,
} from "./agent.policy";
export type {
  AgentPolicyCatalogEntry,
  AgentPolicyCatalogKind,
  AgentPolicyCatalogReport,
  AgentPolicyCatalogSignals,
  AgentPolicyEnforcement,
  AgentPolicyGate,
} from "./agent.policy";

import { buildAgentPolicyCatalog } from "./agent.policy.builder";
import type {
  AgentPolicyCatalogReport,
  AgentPolicyCatalogSignals,
} from "./agent.policy";

export function runAgentPolicyCatalog(input?: {
  deploymentId?: string;
  signals?: AgentPolicyCatalogSignals;
}): AgentPolicyCatalogReport {
  return buildAgentPolicyCatalog(input);
}

export function formatAgentPolicyCatalogSummary(report: AgentPolicyCatalogReport): string {
  const lines = [
    "V75 Agent Policy Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  agent-inventory: ${report.agentInventoryVersion} (ready=${report.agentInventoryReady})`,
    `  policies: ${report.catalog.entryCount}`,
    `  kinds: ${report.catalog.kindCount}`,
    `  gates: ${report.gates.gateCount}`,
  ];
  return lines.join("\n");
}
