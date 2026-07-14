/**
 * E02-P6 — Enterprise Memory Agent Registry
 */

import {
  assertValidMemoryAgentRegistry,
  validateMemoryAgentDefinition,
} from "./memory-agent.schema";
import type {
  MemoryAgentDefinition,
  MemoryAgentRegistryManifest,
  MemoryAgentRole,
} from "./memory-agent.types";
import { V102_MEMORY_AGENT_VERSION } from "./memory-agent.types";

export const MEMORY_AGENT_CATALOG: MemoryAgentDefinition[] = [
  {
    id: "memory.retriever",
    role: "retriever",
    name: "Knowledge Retrieval Agent",
    capability: "retrieve",
    kernelRef: "lib/tender-intelligence/v102/retrieval",
    dependsOn: [],
    optional: false,
    readOnly: true,
  },
  {
    id: "memory.similarity",
    role: "similarity",
    name: "Similar Tender Memory Agent",
    capability: "compare",
    kernelRef: "lib/tender-intelligence/v102/similarity",
    dependsOn: ["memory.retriever"],
    optional: false,
    readOnly: true,
  },
  {
    id: "memory.recommender",
    role: "recommender",
    name: "Enterprise Memory Recommender",
    capability: "recommend",
    kernelRef: "lib/tender-intelligence/v102/memory-agent",
    dependsOn: ["memory.retriever", "memory.similarity"],
    optional: false,
    readOnly: true,
  },
  {
    id: "memory.coordinator",
    role: "coordinator",
    name: "Enterprise Memory Coordinator",
    capability: "coordinate",
    kernelRef: "lib/tender-intelligence/v102/memory-agent",
    dependsOn: ["memory.retriever", "memory.similarity", "memory.recommender"],
    optional: false,
    readOnly: true,
  },
];

export function buildMemoryAgentRegistryManifest(): MemoryAgentRegistryManifest {
  for (const agent of MEMORY_AGENT_CATALOG) {
    const result = validateMemoryAgentDefinition(agent);
    if (!result.ok) {
      throw new Error(
        `Invalid memory agent catalog entry ${agent.id}: ${result.issues
          .map((i) => `${i.path}: ${i.message}`)
          .join("; ")}`,
      );
    }
  }

  const roles = [...new Set(MEMORY_AGENT_CATALOG.map((a) => a.role))];
  const requiredRoles: MemoryAgentRole[] = [
    "retriever",
    "similarity",
    "recommender",
    "coordinator",
  ];
  const catalogComplete = requiredRoles.every((role) => roles.includes(role));

  const registry: MemoryAgentRegistryManifest = {
    version: V102_MEMORY_AGENT_VERSION,
    agentCount: MEMORY_AGENT_CATALOG.length,
    roles,
    agents: MEMORY_AGENT_CATALOG,
    catalogComplete,
    readOnly: true,
  };

  assertValidMemoryAgentRegistry(registry);
  return registry;
}

export function getMemoryAgentById(id: string): MemoryAgentDefinition | undefined {
  return MEMORY_AGENT_CATALOG.find((a) => a.id === id);
}

export function getMemoryAgentByRole(
  role: MemoryAgentRole,
): MemoryAgentDefinition | undefined {
  return MEMORY_AGENT_CATALOG.find((a) => a.role === role);
}

export function listExecutableMemoryAgents(): MemoryAgentDefinition[] {
  return MEMORY_AGENT_CATALOG.filter((a) => a.role !== "coordinator");
}

export function isMemoryAgentDependencyGraphValid(): boolean {
  const ids = new Set(MEMORY_AGENT_CATALOG.map((a) => a.id));
  for (const agent of MEMORY_AGENT_CATALOG) {
    for (const dep of agent.dependsOn) {
      if (!ids.has(dep)) return false;
    }
  }
  return true;
}
