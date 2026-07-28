/**
 * Product M12 — Agent invocation contract (in-memory, declarative)
 * Declarative match against registered agents/capabilities — no execution.
 */

import { AGENT_INVOCATION_MODES } from "./agent.constants";
import { listAgentCapabilities } from "./capability.registry";
import { listAgentDefinitions } from "./agent.registry";
import type {
  AgentCapability,
  AgentDefinition,
  AgentInvocationContract,
  AgentInvocationHit,
  AgentInvocationQuery,
  EvaluateAgentInvocationContractInput,
} from "./agent.types";

const contracts = new Map<string, AgentInvocationContract>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneContract(
  contract: AgentInvocationContract,
): AgentInvocationContract {
  return {
    ...contract,
    query: {
      ...contract.query,
      agentKeys: contract.query.agentKeys
        ? [...contract.query.agentKeys]
        : undefined,
    },
    hits: contract.hits.map((h) => ({ ...h })),
    metadata: { ...contract.metadata },
  };
}

function matchCapability(
  agent: AgentDefinition,
  capability: AgentCapability,
  query: AgentInvocationQuery,
): AgentInvocationHit | undefined {
  if (agent.status !== "ACTIVE" && agent.status !== "DRAFT") return undefined;
  if (
    capability.status !== "DECLARED" &&
    capability.status !== "DRAFT"
  ) {
    return undefined;
  }
  if (query.role && agent.role !== query.role) return undefined;
  if (query.scope && agent.scope !== query.scope) return undefined;
  if (query.capabilityKind && capability.kind !== query.capabilityKind) {
    return undefined;
  }

  const agentKeys = (query.agentKeys ?? []).map((k) => k.trim().toUpperCase());
  if (agentKeys.length > 0 && !agentKeys.includes(agent.agentKey)) {
    return undefined;
  }

  if (query.mode === "DECLARED") {
    if (agentKeys.includes(agent.agentKey)) {
      return {
        agentId: agent.id,
        agentKey: agent.agentKey,
        role: agent.role,
        capabilityKey: capability.capabilityKey,
        matchedOn: "AGENT",
      };
    }
    if (query.role && agent.role === query.role) {
      return {
        agentId: agent.id,
        agentKey: agent.agentKey,
        role: agent.role,
        capabilityKey: capability.capabilityKey,
        matchedOn: "ROLE",
      };
    }
    if (query.capabilityKind && capability.kind === query.capabilityKind) {
      return {
        agentId: agent.id,
        agentKey: agent.agentKey,
        role: agent.role,
        capabilityKey: capability.capabilityKey,
        matchedOn: "CAPABILITY",
      };
    }
    if (query.scope && agent.scope === query.scope) {
      return {
        agentId: agent.id,
        agentKey: agent.agentKey,
        role: agent.role,
        capabilityKey: capability.capabilityKey,
        matchedOn: "SCOPE",
      };
    }
    return undefined;
  }

  if (query.mode === "ROUTINE") {
    if (query.role && agent.role === query.role) {
      return {
        agentId: agent.id,
        agentKey: agent.agentKey,
        role: agent.role,
        capabilityKey: capability.capabilityKey,
        matchedOn: "ROLE",
      };
    }
    return undefined;
  }

  // HANDSHAKE — exact agent key required
  if (agentKeys.includes(agent.agentKey)) {
    return {
      agentId: agent.id,
      agentKey: agent.agentKey,
      role: agent.role,
      capabilityKey: capability.capabilityKey,
      matchedOn: "AGENT",
    };
  }
  return undefined;
}

export function evaluateAgentInvocationContract(
  input: EvaluateAgentInvocationContractInput,
): AgentInvocationContract {
  const contractKey = input.contractKey.trim().toUpperCase();
  if (!contractKey) throw new Error("contract.contractKey is required");
  if (keys.has(contractKey)) {
    throw new Error(`contractKey already exists: ${contractKey}`);
  }
  if (
    !(AGENT_INVOCATION_MODES as readonly string[]).includes(input.query.mode)
  ) {
    throw new Error(`invalid invocation mode: ${input.query.mode}`);
  }
  const hasFilter =
    Boolean(input.query.role) ||
    Boolean(input.query.capabilityKind) ||
    Boolean(input.query.scope) ||
    Boolean(input.query.agentKeys?.length);
  if (!hasFilter) {
    throw new Error(
      "query.role, query.capabilityKind, query.scope, or query.agentKeys is required",
    );
  }

  const id = input.id?.trim() || createId("agtinv");
  if (contracts.has(id)) throw new Error(`contract already exists: ${id}`);

  const agents = listAgentDefinitions();
  const agentById = new Map(agents.map((a) => [a.id, a]));
  const hits = listAgentCapabilities()
    .map((capability) => {
      const agent = agentById.get(capability.agentId);
      if (!agent) return undefined;
      return matchCapability(agent, capability, input.query);
    })
    .filter((h): h is AgentInvocationHit => h !== undefined)
    .sort((a, b) => a.agentKey.localeCompare(b.agentKey));

  const contract: AgentInvocationContract = {
    id,
    contractKey,
    query: {
      ...input.query,
      queryKey: input.query.queryKey.trim().toUpperCase(),
      agentKeys: input.query.agentKeys
        ? input.query.agentKeys.map((k) => k.trim().toUpperCase())
        : undefined,
    },
    hitCount: hits.length,
    hits,
    detail: `mode=${input.query.mode} hits=${hits.length}`,
    metadata: { ...(input.metadata ?? {}) },
    evaluatedAt: nowIso(),
  };
  contracts.set(id, contract);
  keys.set(contractKey, id);
  return cloneContract(contract);
}

export function getAgentInvocationContract(
  id: string,
): AgentInvocationContract | undefined {
  const contract = contracts.get(id.trim());
  return contract ? cloneContract(contract) : undefined;
}

export function listAgentInvocationContracts(): AgentInvocationContract[] {
  return [...contracts.values()]
    .slice()
    .sort((a, b) => a.contractKey.localeCompare(b.contractKey))
    .map(cloneContract);
}

export function clearAgentInvocationContracts(): void {
  contracts.clear();
  keys.clear();
}
