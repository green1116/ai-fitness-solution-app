/**
 * E08-P6 — Autonomous Market Agent Registry
 * Market agents bind missions onto E08 ecosystem intelligence
 */

import { getIntelligenceById } from "../intelligence/intelligence.registry";
import {
  E08_MARKET_AGENT_ID,
  E08_MARKET_BASE,
  E08_MARKET_FREEZE_VERSION,
  E08_MARKET_VERSION,
  MARKET_MISSIONS,
  MARKET_POSTURES,
} from "./market.constants";
import type {
  MarketAgentDefinition,
  MarketAgentRegistryManifest,
  MarketMission,
} from "./market.types";

export const MARKET_AGENT_CATALOG: MarketAgentDefinition[] = [
  {
    id: "e08.market.capture",
    name: "Market Capture Agent",
    mission: "capture",
    description: "Capture supply-side market opportunity via coverage intelligence",
    intelligenceId: "e08.intel.supply-coverage",
    preferredPosture: "aggressive",
    correctiveBelow: 60,
    optional: false,
    readOnly: true,
  },
  {
    id: "e08.market.expand",
    name: "Market Expansion Agent",
    mission: "expand",
    description: "Expand distribution reach via expansion intelligence",
    intelligenceId: "e08.intel.market-expansion",
    preferredPosture: "balanced",
    correctiveBelow: 60,
    optional: false,
    readOnly: true,
  },
  {
    id: "e08.market.stabilize",
    name: "Market Stabilize Agent",
    mission: "stabilize",
    description: "Stabilize cross-enterprise posture via coherence intelligence",
    intelligenceId: "e08.intel.enterprise-coherence",
    preferredPosture: "cautious",
    correctiveBelow: 70,
    optional: false,
    readOnly: true,
  },
];

export function assertMarketAgentDefinition(
  agent: MarketAgentDefinition,
): void {
  if (!agent.id.trim()) throw new Error("agent.id is required");
  if (!agent.name.trim()) throw new Error("agent.name is required");
  if (!(MARKET_MISSIONS as readonly string[]).includes(agent.mission)) {
    throw new Error(`invalid market mission: ${agent.mission}`);
  }
  if (!(MARKET_POSTURES as readonly string[]).includes(agent.preferredPosture)) {
    throw new Error(`invalid market posture: ${agent.preferredPosture}`);
  }
  if (agent.readOnly !== true) throw new Error("readOnly must be true");
  if (agent.correctiveBelow < 0 || agent.correctiveBelow > 100) {
    throw new Error(`invalid correctiveBelow on ${agent.id}`);
  }

  if (!getIntelligenceById(agent.intelligenceId)) {
    throw new Error(`missing E08 intelligence: ${agent.intelligenceId}`);
  }
}

export function getMarketAgentById(
  id: string,
): MarketAgentDefinition | undefined {
  return MARKET_AGENT_CATALOG.find((a) => a.id === id);
}

export function getMarketAgentByMission(
  mission: MarketMission,
): MarketAgentDefinition | undefined {
  return MARKET_AGENT_CATALOG.find((a) => a.mission === mission);
}

export function listMarketAgentsForIntelligence(
  intelligenceId: string,
): MarketAgentDefinition[] {
  return MARKET_AGENT_CATALOG.filter(
    (a) => a.intelligenceId === intelligenceId,
  );
}

export function buildMarketAgentRegistryManifest(
  agents: MarketAgentDefinition[] = MARKET_AGENT_CATALOG,
): MarketAgentRegistryManifest {
  for (const agent of agents) {
    assertMarketAgentDefinition(agent);
  }

  const missions = [...new Set(agents.map((a) => a.mission))];
  const catalogComplete = MARKET_MISSIONS.every((m) => missions.includes(m));
  if (!catalogComplete) {
    throw new Error("Market agent catalog incomplete: missing missions");
  }

  return {
    agentPlatformId: E08_MARKET_AGENT_ID,
    version: E08_MARKET_VERSION,
    freezeVersion: E08_MARKET_FREEZE_VERSION,
    base: E08_MARKET_BASE,
    agentCount: agents.length,
    missions,
    agents,
    catalogComplete: true,
    readOnly: true,
  };
}
