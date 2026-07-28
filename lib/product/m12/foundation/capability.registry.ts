/**
 * Product M12 — Agent capability in-memory registry
 */

import { AGENT_CAPABILITY_KINDS, AGENT_CAPABILITY_STATUSES } from "./agent.constants";
import { getAgentDefinition } from "./agent.registry";
import type {
  AgentCapability,
  AgentCapabilityKind,
  AgentCapabilityStatus,
  RegisterAgentCapabilityInput,
  UpdateAgentCapabilityStatusInput,
} from "./agent.types";

const capabilities = new Map<string, AgentCapability>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCapability(capability: AgentCapability): AgentCapability {
  return { ...capability, metadata: { ...capability.metadata } };
}

export function registerAgentCapability(
  input: RegisterAgentCapabilityInput,
): AgentCapability {
  const agentId = input.agentId.trim();
  const capabilityKey = input.capabilityKey.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!agentId) throw new Error("capability.agentId is required");
  if (!capabilityKey) throw new Error("capability.capabilityKey is required");
  if (!summary) throw new Error("capability.summary is required");
  if (
    !(AGENT_CAPABILITY_KINDS as readonly string[]).includes(input.kind)
  ) {
    throw new Error(`invalid capability kind: ${input.kind}`);
  }
  if (keys.has(capabilityKey)) {
    throw new Error(`capabilityKey already exists: ${capabilityKey}`);
  }

  const agent = getAgentDefinition(agentId);
  if (!agent) throw new Error(`agent not found: ${agentId}`);
  if (agent.status !== "ACTIVE" && agent.status !== "DRAFT") {
    throw new Error(`agent not capable: ${agent.agentKey}`);
  }

  const id = input.id?.trim() || createId("agtcap");
  if (capabilities.has(id)) {
    throw new Error(`capability already exists: ${id}`);
  }

  const now = nowIso();
  const capability: AgentCapability = {
    id,
    agentId,
    capabilityKey,
    kind: input.kind,
    status: AGENT_CAPABILITY_STATUSES[0],
    summary,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  capabilities.set(id, capability);
  keys.set(capabilityKey, id);
  return cloneCapability(capability);
}

export function updateAgentCapabilityStatus(
  input: UpdateAgentCapabilityStatusInput,
): AgentCapability {
  const capabilityId = input.capabilityId.trim();
  if (!capabilityId) throw new Error("capability.capabilityId is required");
  if (
    !(AGENT_CAPABILITY_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid capability status: ${input.status}`);
  }

  const existing = capabilities.get(capabilityId);
  if (!existing) throw new Error(`capability not found: ${capabilityId}`);

  const updated: AgentCapability = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  capabilities.set(capabilityId, updated);
  return cloneCapability(updated);
}

export function getAgentCapability(
  id: string,
): AgentCapability | undefined {
  const capability = capabilities.get(id.trim());
  return capability ? cloneCapability(capability) : undefined;
}

export function listAgentCapabilities(filter?: {
  agentId?: string;
  kind?: AgentCapabilityKind;
  status?: AgentCapabilityStatus;
}): AgentCapability[] {
  let result = [...capabilities.values()];
  if (filter?.agentId) {
    result = result.filter((c) => c.agentId === filter.agentId);
  }
  if (filter?.kind) result = result.filter((c) => c.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((c) => c.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.capabilityKey.localeCompare(b.capabilityKey))
    .map(cloneCapability);
}

export function clearAgentCapabilities(): void {
  capabilities.clear();
  keys.clear();
}
