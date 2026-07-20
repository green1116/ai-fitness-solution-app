/**
 * E09-P6 — Global Agent Registry
 * Registers agents optionally bound to federation / identity
 */

import { getFederation } from "../federation/federation.registry";
import { getIdentity } from "../identity/global.identity";
import {
  E09_AGENT_BASE,
  E09_AGENT_FREEZE_VERSION,
  E09_AGENT_ID,
  E09_AGENT_VERSION,
  AGENT_ROLES,
  AGENT_STATUSES,
} from "./agent.constants";
import type {
  AgentRegistryManifest,
  AgentRole,
  AgentStatus,
  GlobalAgent,
  RegisterAgentInput,
} from "./agent.types";

const agents = new Map<string, GlobalAgent>();

function cloneAgent(agent: GlobalAgent): GlobalAgent {
  return {
    ...agent,
    capabilities: [...agent.capabilities],
    metadata: { ...agent.metadata },
  };
}

function assertRole(role: string): asserts role is AgentRole {
  if (!(AGENT_ROLES as readonly string[]).includes(role)) {
    throw new Error(`invalid agent role: ${role}`);
  }
}

function assertStatus(status: string): asserts status is AgentStatus {
  if (!(AGENT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid agent status: ${status}`);
  }
}

function clampTrustLevel(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error("trustLevel must be a finite number");
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function registerAgent(input: RegisterAgentInput): GlobalAgent {
  const id = input.id.trim();
  const name = input.name.trim();
  if (!id) throw new Error("agent.id is required");
  if (!name) throw new Error("agent.name is required");
  assertRole(input.role);

  const status = input.status ?? "IDLE";
  assertStatus(status);

  if (agents.has(id)) {
    throw new Error(`agent already registered: ${id}`);
  }

  const federationId = input.federationId?.trim();
  if (federationId && !getFederation(federationId)) {
    throw new Error(`federation not found: ${federationId}`);
  }

  const identityId = input.identityId?.trim();
  if (identityId && !getIdentity(identityId)) {
    throw new Error(`identity not found: ${identityId}`);
  }

  const capabilities = (input.capabilities ?? [])
    .map((c) => c.trim())
    .filter(Boolean);

  const agent: GlobalAgent = {
    id,
    name,
    role: input.role,
    status,
    federationId: federationId || undefined,
    identityId: identityId || undefined,
    capabilities,
    trustLevel: clampTrustLevel(input.trustLevel ?? 50),
    metadata: { ...(input.metadata ?? {}) },
  };

  agents.set(id, agent);
  return cloneAgent(agent);
}

export function getAgent(id: string): GlobalAgent | undefined {
  const agent = agents.get(id.trim());
  return agent ? cloneAgent(agent) : undefined;
}

export function listAgents(filter?: {
  status?: AgentStatus;
  role?: AgentRole;
  federationId?: string;
  identityId?: string;
}): GlobalAgent[] {
  let result = [...agents.values()];
  if (filter?.status) {
    result = result.filter((a) => a.status === filter.status);
  }
  if (filter?.role) {
    result = result.filter((a) => a.role === filter.role);
  }
  if (filter?.federationId) {
    const federationId = filter.federationId.trim();
    result = result.filter((a) => a.federationId === federationId);
  }
  if (filter?.identityId) {
    const identityId = filter.identityId.trim();
    result = result.filter((a) => a.identityId === identityId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAgent);
}

export function removeAgent(id: string): boolean {
  return agents.delete(id.trim());
}

/** Persist agent status mutation (used by coordinator). */
export function setAgentStatus(
  id: string,
  status: AgentStatus,
): GlobalAgent {
  const agent = agents.get(id.trim());
  if (!agent) throw new Error(`agent not found: ${id}`);
  assertStatus(status);
  agent.status = status;
  agents.set(agent.id, agent);
  return cloneAgent(agent);
}

export function buildAgentRegistryManifest(): AgentRegistryManifest {
  const list = listAgents();
  return {
    agentId: E09_AGENT_ID,
    version: E09_AGENT_VERSION,
    freezeVersion: E09_AGENT_FREEZE_VERSION,
    base: E09_AGENT_BASE,
    agentCount: list.length,
    agents: list,
  };
}

export function clearAgents(): void {
  agents.clear();
}
