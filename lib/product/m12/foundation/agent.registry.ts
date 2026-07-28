/**
 * Product M12 — Agent definition in-memory registry
 */

import {
  AGENT_STATUSES,
  PRODUCT_AGENT_FOUNDATION_BASE,
} from "./agent.constants";
import { validateAgentDefinitionInput } from "./agent.metadata";
import type {
  AgentDefinition,
  AgentRole,
  AgentStatus,
  RegisterAgentDefinitionInput,
  UpdateAgentDefinitionStatusInput,
} from "./agent.types";

const agents = new Map<string, AgentDefinition>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAgent(agent: AgentDefinition): AgentDefinition {
  return { ...agent, metadata: { ...agent.metadata } };
}

export function registerAgentDefinition(
  input: RegisterAgentDefinitionInput,
): AgentDefinition {
  const validation = validateAgentDefinitionInput(input);
  if (!validation.ok) {
    const first = validation.issues[0];
    throw new Error(
      `invalid agent definition: ${first?.field} ${first?.message}`,
    );
  }

  const agentKey = input.agentKey.trim().toUpperCase();
  const title = input.title.trim();
  const summary = input.summary.trim();
  const knowledgeBaselineRef = (
    input.knowledgeBaselineRef ?? PRODUCT_AGENT_FOUNDATION_BASE
  )
    .trim()
    .toLowerCase();

  if (keys.has(agentKey)) {
    throw new Error(`agentKey already exists: ${agentKey}`);
  }

  const id = input.id?.trim() || createId("agent");
  if (agents.has(id)) throw new Error(`agent already exists: ${id}`);

  const now = nowIso();
  const agent: AgentDefinition = {
    id,
    agentKey,
    role: input.role,
    status: AGENT_STATUSES[0],
    scope: input.scope,
    title,
    summary,
    knowledgeBaselineRef,
    detail: `role=${input.role} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  agents.set(id, agent);
  keys.set(agentKey, id);
  return cloneAgent(agent);
}

export function updateAgentDefinitionStatus(
  input: UpdateAgentDefinitionStatusInput,
): AgentDefinition {
  const agentId = input.agentId.trim();
  if (!agentId) throw new Error("agent.agentId is required");
  if (!(AGENT_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid agent status: ${input.status}`);
  }

  const existing = agents.get(agentId);
  if (!existing) throw new Error(`agent not found: ${agentId}`);

  const updated: AgentDefinition = {
    ...existing,
    status: input.status,
    detail: `role=${existing.role} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  agents.set(agentId, updated);
  return cloneAgent(updated);
}

export function getAgentDefinition(id: string): AgentDefinition | undefined {
  const agent = agents.get(id.trim());
  return agent ? cloneAgent(agent) : undefined;
}

export function getAgentDefinitionByKey(
  agentKey: string,
): AgentDefinition | undefined {
  const id = keys.get(agentKey.trim().toUpperCase());
  return id ? getAgentDefinition(id) : undefined;
}

export function listAgentDefinitions(filter?: {
  role?: AgentRole;
  status?: AgentStatus;
}): AgentDefinition[] {
  let result = [...agents.values()];
  if (filter?.role) result = result.filter((a) => a.role === filter.role);
  if (filter?.status) {
    result = result.filter((a) => a.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.agentKey.localeCompare(b.agentKey))
    .map(cloneAgent);
}

export function clearAgentDefinitions(): void {
  agents.clear();
  keys.clear();
}
