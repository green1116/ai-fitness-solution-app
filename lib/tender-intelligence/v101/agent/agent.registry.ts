/**
 * E01-P6 — Agent Registry (static catalog for tender intelligence agents)
 */

import {
  assertValidRegistry,
  validateAgentDefinition,
} from "./agent.schema";
import type {
  AgentDefinition,
  AgentRegistryManifest,
  AgentRole,
} from "./agent.types";
import { V101_AGENT_ORCHESTRATION_VERSION } from "./agent.types";

export const AGENT_CATALOG: AgentDefinition[] = [
  {
    id: "agent.intake",
    role: "intake",
    name: "Tender Intake Agent",
    capability: "ingest",
    kernelRef: "lib/tender-intelligence/v101/intake",
    dependsOn: [],
    optional: false,
    readOnly: true,
  },
  {
    id: "agent.understanding",
    role: "understanding",
    name: "Document Understanding Agent",
    capability: "structure",
    kernelRef: "lib/tender-intelligence/v101/understanding",
    dependsOn: ["agent.intake"],
    optional: false,
    readOnly: true,
  },
  {
    id: "agent.intelligence",
    role: "intelligence",
    name: "Tender Intelligence Agent",
    capability: "analyze",
    kernelRef: "lib/tender-intelligence/v101/intelligence",
    dependsOn: ["agent.understanding"],
    optional: false,
    readOnly: true,
  },
  {
    id: "agent.strategy",
    role: "strategy",
    name: "Bid Strategy Agent",
    capability: "decide",
    kernelRef: "lib/tender-intelligence/v101/strategy",
    dependsOn: ["agent.intelligence"],
    optional: false,
    readOnly: true,
  },
  {
    id: "agent.proposal",
    role: "proposal",
    name: "Proposal Intelligence Agent",
    capability: "compose",
    kernelRef: "lib/tender-intelligence/v101/proposal",
    dependsOn: ["agent.strategy", "agent.understanding"],
    optional: false,
    readOnly: true,
  },
  {
    id: "agent.orchestrator",
    role: "orchestrator",
    name: "Enterprise Orchestrator Agent",
    capability: "coordinate",
    kernelRef: "lib/tender-intelligence/v101/agent",
    dependsOn: [
      "agent.intake",
      "agent.understanding",
      "agent.intelligence",
      "agent.strategy",
      "agent.proposal",
    ],
    optional: false,
    readOnly: true,
  },
];

export function buildAgentRegistryManifest(): AgentRegistryManifest {
  for (const agent of AGENT_CATALOG) {
    const result = validateAgentDefinition(agent);
    if (!result.ok) {
      throw new Error(
        `Invalid agent catalog entry ${agent.id}: ${result.issues
          .map((i) => `${i.path}: ${i.message}`)
          .join("; ")}`,
      );
    }
  }

  const roles = [...new Set(AGENT_CATALOG.map((a) => a.role))];
  const requiredRoles: AgentRole[] = [
    "intake",
    "understanding",
    "intelligence",
    "strategy",
    "proposal",
    "orchestrator",
  ];
  const catalogComplete = requiredRoles.every((role) => roles.includes(role));

  const registry: AgentRegistryManifest = {
    version: V101_AGENT_ORCHESTRATION_VERSION,
    agentCount: AGENT_CATALOG.length,
    roles,
    agents: AGENT_CATALOG,
    catalogComplete,
    readOnly: true,
  };

  assertValidRegistry(registry);
  return registry;
}

export function getAgentById(id: string): AgentDefinition | undefined {
  return AGENT_CATALOG.find((a) => a.id === id);
}

export function getAgentByRole(role: AgentRole): AgentDefinition | undefined {
  return AGENT_CATALOG.find((a) => a.role === role);
}

export function listExecutableAgents(): AgentDefinition[] {
  return AGENT_CATALOG.filter((a) => a.role !== "orchestrator");
}

export function isAgentDependencyGraphValid(): boolean {
  const ids = new Set(AGENT_CATALOG.map((a) => a.id));
  for (const agent of AGENT_CATALOG) {
    for (const dep of agent.dependsOn) {
      if (!ids.has(dep)) return false;
    }
  }
  return true;
}
