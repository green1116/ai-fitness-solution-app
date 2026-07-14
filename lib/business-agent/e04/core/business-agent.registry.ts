/**
 * E04-P1 — Business Agent Registry
 * Binds business agents onto E03 runtime agent identities
 */

import { getAgentById } from "../../../agent-platform/e03/core/agent.registry";
import {
  BUSINESS_AGENT_DOMAINS,
  E04_BUSINESS_AGENT_BASE,
  E04_BUSINESS_AGENT_FREEZE_VERSION,
  E04_BUSINESS_AGENT_PLATFORM_ID,
  E04_BUSINESS_AGENT_VERSION,
} from "./business-agent.constants";
import type {
  BusinessAgentDefinition,
  BusinessAgentDomain,
  BusinessAgentRegistryManifest,
} from "./business-agent.types";
import { getCapabilityById } from "../capability/capability.registry";

export const BUSINESS_AGENT_CATALOG: BusinessAgentDefinition[] = [
  {
    id: "e04.business.tender",
    name: "Tender Business Agent",
    domain: "tender",
    description: "Owns tender intake and proposal framing",
    runtimeAgentId: "e03.agent.planner",
    runtimeRole: "planner",
    runtimeCapability: "plan",
    capabilityIds: ["e04.cap.intake", "e04.cap.propose"],
    dependsOn: [],
    optional: false,
    readOnly: true,
  },
  {
    id: "e04.business.budget",
    name: "Budget Business Agent",
    domain: "budget",
    description: "Owns commercial pricing alignment",
    runtimeAgentId: "e03.agent.worker",
    runtimeRole: "worker",
    runtimeCapability: "execute",
    capabilityIds: ["e04.cap.price", "e04.cap.estimate"],
    dependsOn: ["e04.business.tender"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e04.business.equipment",
    name: "Equipment Business Agent",
    domain: "equipment",
    description: "Owns equipment scope estimation cues",
    runtimeAgentId: "e03.agent.tool",
    runtimeRole: "tool",
    runtimeCapability: "invoke",
    capabilityIds: ["e04.cap.estimate"],
    dependsOn: ["e04.business.tender"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e04.business.compliance",
    name: "Compliance Business Agent",
    domain: "compliance",
    description: "Owns compliance and review gates",
    runtimeAgentId: "e03.agent.critic",
    runtimeRole: "critic",
    runtimeCapability: "evaluate",
    capabilityIds: ["e04.cap.review"],
    dependsOn: ["e04.business.tender", "e04.business.budget"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e04.business.delivery",
    name: "Delivery Business Agent",
    domain: "delivery",
    description: "Owns delivery packaging commitments",
    runtimeAgentId: "e03.agent.memory",
    runtimeRole: "memory",
    runtimeCapability: "remember",
    capabilityIds: ["e04.cap.deliver"],
    dependsOn: ["e04.business.compliance"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e04.business.coordinator",
    name: "Business Coordinator Agent",
    domain: "coordination",
    description: "Coordinates E04 business agents over E03 runtime",
    runtimeAgentId: "e03.agent.coordinator",
    runtimeRole: "coordinator",
    runtimeCapability: "orchestrate",
    capabilityIds: ["e04.cap.coordinate"],
    dependsOn: [
      "e04.business.tender",
      "e04.business.budget",
      "e04.business.equipment",
      "e04.business.compliance",
      "e04.business.delivery",
    ],
    optional: false,
    readOnly: true,
  },
];

function assertBusinessAgentDefinition(agent: BusinessAgentDefinition): void {
  if (!agent.id.trim()) throw new Error("business agent.id is required");
  if (!agent.name.trim()) throw new Error("business agent.name is required");
  if (!(BUSINESS_AGENT_DOMAINS as readonly string[]).includes(agent.domain)) {
    throw new Error(`invalid domain: ${agent.domain}`);
  }
  if (agent.readOnly !== true) throw new Error("readOnly must be true");

  const runtime = getAgentById(agent.runtimeAgentId);
  if (!runtime) {
    throw new Error(`missing E03 runtime binding: ${agent.runtimeAgentId}`);
  }
  if (runtime.role !== agent.runtimeRole) {
    throw new Error(
      `runtime role mismatch for ${agent.id}: expected ${agent.runtimeRole} got ${runtime.role}`,
    );
  }
  if (runtime.capability !== agent.runtimeCapability) {
    throw new Error(
      `runtime capability mismatch for ${agent.id}: expected ${agent.runtimeCapability} got ${runtime.capability}`,
    );
  }

  for (const capabilityId of agent.capabilityIds) {
    if (!getCapabilityById(capabilityId)) {
      throw new Error(`unknown capability ${capabilityId} on ${agent.id}`);
    }
  }
}

export function isBusinessAgentDependencyGraphValid(
  agents: BusinessAgentDefinition[] = BUSINESS_AGENT_CATALOG,
): boolean {
  const ids = new Set(agents.map((a) => a.id));
  for (const agent of agents) {
    for (const dep of agent.dependsOn) {
      if (!ids.has(dep)) return false;
    }
  }
  return true;
}

export function buildBusinessAgentRegistryManifest(
  agents: BusinessAgentDefinition[] = BUSINESS_AGENT_CATALOG,
): BusinessAgentRegistryManifest {
  for (const agent of agents) {
    assertBusinessAgentDefinition(agent);
  }
  if (!isBusinessAgentDependencyGraphValid(agents)) {
    throw new Error("Business agent dependency graph is invalid");
  }

  const domains = [...new Set(agents.map((a) => a.domain))];
  const requiredDomains: BusinessAgentDomain[] = [...BUSINESS_AGENT_DOMAINS];
  const catalogComplete = requiredDomains.every((d) => domains.includes(d));
  if (!catalogComplete) {
    throw new Error("Business agent catalog incomplete: missing domains");
  }

  return {
    platformId: E04_BUSINESS_AGENT_PLATFORM_ID,
    version: E04_BUSINESS_AGENT_VERSION,
    freezeVersion: E04_BUSINESS_AGENT_FREEZE_VERSION,
    base: E04_BUSINESS_AGENT_BASE,
    agentCount: agents.length,
    domains,
    agents,
    catalogComplete: true,
    readOnly: true,
  };
}

export function getBusinessAgentById(
  id: string,
): BusinessAgentDefinition | undefined {
  return BUSINESS_AGENT_CATALOG.find((a) => a.id === id);
}

export function getBusinessAgentByDomain(
  domain: BusinessAgentDomain,
): BusinessAgentDefinition | undefined {
  return BUSINESS_AGENT_CATALOG.find((a) => a.domain === domain);
}

export function listExecutableBusinessAgents(): BusinessAgentDefinition[] {
  return BUSINESS_AGENT_CATALOG.filter((a) => a.domain !== "coordination");
}
