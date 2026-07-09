/**
 * V75 P2 — Agent policy catalog builder (read-only)
 */
import { buildAgentInventory } from "./agent.inventory";
import { V75_AGENT_VERSION } from "./agent.types";
import {
  buildAgentPolicyCatalogManifest,
  buildAgentPolicyGateManifest,
  isAgentPolicyCatalogRefsAligned,
} from "./agent.policy.catalog";
import type {
  AgentPolicyCatalogReport,
  AgentPolicyCatalogSignals,
} from "./agent.policy";
import {
  V75_AGENT_POLICY_FREEZE_VERSION,
  V75_AGENT_POLICY_VERSION,
} from "./agent.policy";

const DEFAULT_SIGNALS: AgentPolicyCatalogSignals = {
  agentInventoryReady: true,
  catalogComplete: true,
  gatesComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildAgentPolicyCatalog(input?: {
  deploymentId?: string;
  signals?: AgentPolicyCatalogSignals;
}): AgentPolicyCatalogReport {
  const deploymentId = input?.deploymentId ?? "v75-agent-policy-catalog-default";

  const agentInventory = buildAgentInventory({ deploymentId });
  const catalog = buildAgentPolicyCatalogManifest();
  const gates = buildAgentPolicyGateManifest();
  const refsAligned = isAgentPolicyCatalogRefsAligned();

  const signals: AgentPolicyCatalogSignals = {
    ...DEFAULT_SIGNALS,
    agentInventoryReady: agentInventory.inventoryReady,
    catalogComplete: catalog.catalogComplete,
    gatesComplete: gates.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V75_AGENT_POLICY_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    agentInventory.inventoryReady &&
    catalog.catalogComplete &&
    gates.catalogComplete &&
    refsAligned &&
    signals.agentInventoryReady !== false;

  return {
    version: V75_AGENT_POLICY_VERSION,
    freezeVersion: V75_AGENT_POLICY_FREEZE_VERSION,
    reportId: `agent-policy-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    agentInventoryVersion: V75_AGENT_VERSION,
    agentInventoryReady: agentInventory.inventoryReady,
    catalog,
    gates,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `agent-policy-catalog ready=${catalogReady}`,
      `policies=${catalog.entryCount}`,
      `kinds=${catalog.kindCount}`,
      `gates=${gates.gateCount}`,
      `refsAligned=${refsAligned}`,
      `inventory=${agentInventory.inventoryReady}`,
    ].join(" "),
  };
}

export function assertAgentPolicyCatalogPass(
  report: AgentPolicyCatalogReport,
): asserts report is AgentPolicyCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V75 agent policy catalog not ready: ${report.summary}`);
  }
}
