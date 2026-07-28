/**
 * Product M15 — Evolution learning insight contract (in-memory, declarative)
 * Declarative match against registered learnings/capabilities —
 * no optimization / recommendation / execution.
 */

import { EVOLUTION_LEARNING_INSIGHT_MODES } from "./learning.constants";
import { listEvolutionLearningCapabilities } from "./capability.registry";
import { listEvolutionLearnings } from "./learning.registry";
import type {
  EvaluateEvolutionLearningInsightContractInput,
  EvolutionLearning,
  EvolutionLearningCapability,
  EvolutionLearningInsightContract,
  EvolutionLearningInsightHit,
  EvolutionLearningInsightQuery,
} from "./learning.types";

const contracts = new Map<string, EvolutionLearningInsightContract>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneContract(
  contract: EvolutionLearningInsightContract,
): EvolutionLearningInsightContract {
  return {
    ...contract,
    query: {
      ...contract.query,
      learningKeys: contract.query.learningKeys
        ? [...contract.query.learningKeys]
        : undefined,
    },
    hits: contract.hits.map((h) => ({ ...h })),
    metadata: { ...contract.metadata },
  };
}

function matchCapability(
  learning: EvolutionLearning,
  capability: EvolutionLearningCapability,
  query: EvolutionLearningInsightQuery,
): EvolutionLearningInsightHit | undefined {
  if (learning.status !== "ACTIVE" && learning.status !== "DRAFT") {
    return undefined;
  }
  if (capability.status !== "DECLARED" && capability.status !== "DRAFT") {
    return undefined;
  }
  if (query.kind && learning.kind !== query.kind) return undefined;
  if (query.scope && learning.scope !== query.scope) return undefined;
  if (query.capabilityKind && capability.kind !== query.capabilityKind) {
    return undefined;
  }

  const learningKeys = (query.learningKeys ?? []).map((k) =>
    k.trim().toUpperCase(),
  );
  if (learningKeys.length > 0 && !learningKeys.includes(learning.learningKey)) {
    return undefined;
  }

  if (query.mode === "DECLARED") {
    if (learningKeys.includes(learning.learningKey)) {
      return {
        learningId: learning.id,
        learningKey: learning.learningKey,
        kind: learning.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "LEARNING",
      };
    }
    if (query.kind && learning.kind === query.kind) {
      return {
        learningId: learning.id,
        learningKey: learning.learningKey,
        kind: learning.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "KIND",
      };
    }
    if (query.capabilityKind && capability.kind === query.capabilityKind) {
      return {
        learningId: learning.id,
        learningKey: learning.learningKey,
        kind: learning.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "CAPABILITY",
      };
    }
    if (query.scope && learning.scope === query.scope) {
      return {
        learningId: learning.id,
        learningKey: learning.learningKey,
        kind: learning.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "SCOPE",
      };
    }
    return undefined;
  }

  if (query.mode === "ROUTINE") {
    if (query.kind && learning.kind === query.kind) {
      return {
        learningId: learning.id,
        learningKey: learning.learningKey,
        kind: learning.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "KIND",
      };
    }
    return undefined;
  }

  // HANDSHAKE — exact learning key required
  if (learningKeys.includes(learning.learningKey)) {
    return {
      learningId: learning.id,
      learningKey: learning.learningKey,
      kind: learning.kind,
      capabilityKey: capability.capabilityKey,
      matchedOn: "LEARNING",
    };
  }
  return undefined;
}

export function evaluateEvolutionLearningInsightContract(
  input: EvaluateEvolutionLearningInsightContractInput,
): EvolutionLearningInsightContract {
  const contractKey = input.contractKey.trim().toUpperCase();
  if (!contractKey) throw new Error("contract.contractKey is required");
  if (keys.has(contractKey)) {
    throw new Error(`contractKey already exists: ${contractKey}`);
  }
  if (
    !(EVOLUTION_LEARNING_INSIGHT_MODES as readonly string[]).includes(
      input.query.mode,
    )
  ) {
    throw new Error(`invalid insight mode: ${input.query.mode}`);
  }
  const hasFilter =
    Boolean(input.query.kind) ||
    Boolean(input.query.capabilityKind) ||
    Boolean(input.query.scope) ||
    Boolean(input.query.learningKeys?.length);
  if (!hasFilter) {
    throw new Error(
      "query.kind, query.capabilityKind, query.scope, or query.learningKeys is required",
    );
  }

  const id = input.id?.trim() || createId("evolrnin");
  if (contracts.has(id)) throw new Error(`contract already exists: ${id}`);

  const learnings = listEvolutionLearnings();
  const learningById = new Map(learnings.map((l) => [l.id, l]));
  const hits = listEvolutionLearningCapabilities()
    .map((capability) => {
      const learning = learningById.get(capability.learningId);
      if (!learning) return undefined;
      return matchCapability(learning, capability, input.query);
    })
    .filter((h): h is EvolutionLearningInsightHit => h !== undefined)
    .sort((a, b) => a.learningKey.localeCompare(b.learningKey));

  const contract: EvolutionLearningInsightContract = {
    id,
    contractKey,
    query: {
      ...input.query,
      queryKey: input.query.queryKey.trim().toUpperCase(),
      learningKeys: input.query.learningKeys
        ? input.query.learningKeys.map((k) => k.trim().toUpperCase())
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

export function getEvolutionLearningInsightContract(
  id: string,
): EvolutionLearningInsightContract | undefined {
  const contract = contracts.get(id.trim());
  return contract ? cloneContract(contract) : undefined;
}

export function listEvolutionLearningInsightContracts(): EvolutionLearningInsightContract[] {
  return [...contracts.values()]
    .slice()
    .sort((a, b) => a.contractKey.localeCompare(b.contractKey))
    .map(cloneContract);
}

export function clearEvolutionLearningInsightContracts(): void {
  contracts.clear();
  keys.clear();
}
