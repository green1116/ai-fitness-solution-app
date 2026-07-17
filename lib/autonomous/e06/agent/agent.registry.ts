/**
 * E06-P7 — Autonomous Enterprise Agent Registry
 * Enterprise agents bind missions onto E06 digital twins
 */

import { getTwinById } from "../digital-twin/twin.registry";
import {
  AGENT_MISSIONS,
  AGENT_POSTURES,
  E06_AGENT_BASE,
  E06_AGENT_FREEZE_VERSION,
  E06_AGENT_ID,
  E06_AGENT_VERSION,
} from "./agent.constants";
import type {
  AgentMission,
  EnterpriseAgentDefinition,
  EnterpriseAgentRegistryManifest,
} from "./agent.types";

export const ENTERPRISE_AGENT_CATALOG: EnterpriseAgentDefinition[] = [
  {
    id: "e06.agent.growth",
    name: "Growth Enterprise Agent",
    mission: "growth",
    description: "Drive enterprise growth over the operations twin",
    twinId: "e06.twin.operations",
    preferredPosture: "proactive",
    correctiveBelow: 60,
    optional: false,
    readOnly: true,
  },
  {
    id: "e06.agent.stability",
    name: "Stability Enterprise Agent",
    mission: "stability",
    description: "Hold enterprise stability over the risk twin",
    twinId: "e06.twin.risk",
    preferredPosture: "balanced",
    correctiveBelow: 60,
    optional: false,
    readOnly: true,
  },
  {
    id: "e06.agent.recovery",
    name: "Recovery Enterprise Agent",
    mission: "recovery",
    description: "Recover delivery posture over the delivery twin",
    twinId: "e06.twin.delivery",
    preferredPosture: "conservative",
    correctiveBelow: 70,
    optional: false,
    readOnly: true,
  },
];

export function assertEnterpriseAgentDefinition(
  agent: EnterpriseAgentDefinition,
): void {
  if (!agent.id.trim()) throw new Error("agent.id is required");
  if (!agent.name.trim()) throw new Error("agent.name is required");
  if (!(AGENT_MISSIONS as readonly string[]).includes(agent.mission)) {
    throw new Error(`invalid agent mission: ${agent.mission}`);
  }
  if (!(AGENT_POSTURES as readonly string[]).includes(agent.preferredPosture)) {
    throw new Error(`invalid agent posture: ${agent.preferredPosture}`);
  }
  if (agent.readOnly !== true) throw new Error("readOnly must be true");
  if (agent.correctiveBelow < 0 || agent.correctiveBelow > 100) {
    throw new Error(`invalid correctiveBelow on ${agent.id}`);
  }

  if (!getTwinById(agent.twinId)) {
    throw new Error(`missing E06 twin: ${agent.twinId}`);
  }
}

export function getEnterpriseAgentById(
  id: string,
): EnterpriseAgentDefinition | undefined {
  return ENTERPRISE_AGENT_CATALOG.find((a) => a.id === id);
}

export function getEnterpriseAgentByMission(
  mission: AgentMission,
): EnterpriseAgentDefinition | undefined {
  return ENTERPRISE_AGENT_CATALOG.find((a) => a.mission === mission);
}

export function buildEnterpriseAgentRegistryManifest(
  agents: EnterpriseAgentDefinition[] = ENTERPRISE_AGENT_CATALOG,
): EnterpriseAgentRegistryManifest {
  for (const agent of agents) {
    assertEnterpriseAgentDefinition(agent);
  }

  const missions = [...new Set(agents.map((a) => a.mission))];
  const catalogComplete = AGENT_MISSIONS.every((m) => missions.includes(m));
  if (!catalogComplete) {
    throw new Error("Enterprise agent catalog incomplete: missing missions");
  }

  return {
    agentPlatformId: E06_AGENT_ID,
    version: E06_AGENT_VERSION,
    freezeVersion: E06_AGENT_FREEZE_VERSION,
    base: E06_AGENT_BASE,
    agentCount: agents.length,
    missions,
    agents,
    catalogComplete: true,
    readOnly: true,
  };
}
