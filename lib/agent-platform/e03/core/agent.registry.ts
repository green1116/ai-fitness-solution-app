/**
 * E03-P1 — Agent Registry (static catalog foundation)
 */

import {
  AGENT_ROLES,
  E03_AGENT_PLATFORM_FREEZE_VERSION,
  E03_AGENT_PLATFORM_ID,
  E03_AGENT_PLATFORM_VERSION,
} from "./agent.constants";
import type {
  AgentDefinition,
  AgentRegistryManifest,
  AgentRole,
} from "./agent.types";

export const AGENT_CATALOG: AgentDefinition[] = [
  {
    id: "e03.agent.planner",
    role: "planner",
    name: "Planning Agent",
    capability: "plan",
    description: "Decomposes goals into executable agent plans",
    dependsOn: [],
    optional: false,
    readOnly: true,
  },
  {
    id: "e03.agent.worker",
    role: "worker",
    name: "Worker Agent",
    capability: "execute",
    description: "Executes assigned plan steps",
    dependsOn: ["e03.agent.planner"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e03.agent.critic",
    role: "critic",
    name: "Critic Agent",
    capability: "evaluate",
    description: "Reviews worker outputs against goals and constraints",
    dependsOn: ["e03.agent.worker"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e03.agent.memory",
    role: "memory",
    name: "Memory Agent",
    capability: "remember",
    description: "Stores and recalls agent run context",
    dependsOn: [],
    optional: false,
    readOnly: true,
  },
  {
    id: "e03.agent.tool",
    role: "tool",
    name: "Tool Agent",
    capability: "invoke",
    description: "Invokes platform tools on behalf of workers",
    dependsOn: ["e03.agent.worker"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e03.agent.coordinator",
    role: "coordinator",
    name: "Coordinator Agent",
    capability: "orchestrate",
    description: "Coordinates multi-agent foundation lifecycle",
    dependsOn: [
      "e03.agent.planner",
      "e03.agent.worker",
      "e03.agent.critic",
      "e03.agent.memory",
      "e03.agent.tool",
    ],
    optional: false,
    readOnly: true,
  },
];

function assertAgentDefinition(agent: AgentDefinition): void {
  if (!agent.id.trim()) throw new Error("agent.id is required");
  if (!agent.name.trim()) throw new Error("agent.name is required");
  if (!(AGENT_ROLES as readonly string[]).includes(agent.role)) {
    throw new Error(`invalid agent.role: ${agent.role}`);
  }
  if (agent.readOnly !== true) throw new Error("agent.readOnly must be true");
  if (!Array.isArray(agent.dependsOn)) {
    throw new Error("agent.dependsOn must be an array");
  }
}

export function isAgentDependencyGraphValid(
  agents: AgentDefinition[] = AGENT_CATALOG,
): boolean {
  const ids = new Set(agents.map((a) => a.id));
  for (const agent of agents) {
    for (const dep of agent.dependsOn) {
      if (!ids.has(dep)) return false;
    }
  }
  return true;
}

export function buildAgentRegistryManifest(
  agents: AgentDefinition[] = AGENT_CATALOG,
): AgentRegistryManifest {
  for (const agent of agents) {
    assertAgentDefinition(agent);
  }

  if (!isAgentDependencyGraphValid(agents)) {
    throw new Error("Agent dependency graph is invalid");
  }

  const roles = [...new Set(agents.map((a) => a.role))];
  const requiredRoles: AgentRole[] = [...AGENT_ROLES];
  const catalogComplete = requiredRoles.every((role) => roles.includes(role));

  if (!catalogComplete) {
    throw new Error("Agent catalog is incomplete: missing required roles");
  }

  return {
    platformId: E03_AGENT_PLATFORM_ID,
    version: E03_AGENT_PLATFORM_VERSION,
    freezeVersion: E03_AGENT_PLATFORM_FREEZE_VERSION,
    agentCount: agents.length,
    roles,
    agents,
    catalogComplete: true,
    readOnly: true,
  };
}

export function getAgentById(id: string): AgentDefinition | undefined {
  return AGENT_CATALOG.find((a) => a.id === id);
}

export function getAgentByRole(role: AgentRole): AgentDefinition | undefined {
  return AGENT_CATALOG.find((a) => a.role === role);
}

export function listExecutableAgents(): AgentDefinition[] {
  return AGENT_CATALOG.filter((a) => a.role !== "coordinator");
}
