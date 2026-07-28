/**
 * Product M15 — Evolution optimization evaluation contract (in-memory, declarative)
 * Declarative match against registered proposals/capabilities —
 * no execution / deployment / automation.
 */

import { EVOLUTION_OPTIMIZATION_EVALUATION_MODES } from "./optimization.constants";
import { listEvolutionOptimizationCapabilities } from "./capability.registry";
import { listEvolutionOptimizationProposals } from "./optimization.registry";
import type {
  EvaluateEvolutionOptimizationEvaluationContractInput,
  EvolutionOptimizationCapability,
  EvolutionOptimizationEvaluationContract,
  EvolutionOptimizationEvaluationHit,
  EvolutionOptimizationEvaluationQuery,
  EvolutionOptimizationProposal,
} from "./optimization.types";

const contracts = new Map<string, EvolutionOptimizationEvaluationContract>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneContract(
  contract: EvolutionOptimizationEvaluationContract,
): EvolutionOptimizationEvaluationContract {
  return {
    ...contract,
    query: {
      ...contract.query,
      proposalKeys: contract.query.proposalKeys
        ? [...contract.query.proposalKeys]
        : undefined,
    },
    hits: contract.hits.map((h) => ({ ...h })),
    metadata: { ...contract.metadata },
  };
}

function matchCapability(
  proposal: EvolutionOptimizationProposal,
  capability: EvolutionOptimizationCapability,
  query: EvolutionOptimizationEvaluationQuery,
): EvolutionOptimizationEvaluationHit | undefined {
  if (proposal.status !== "ACTIVE" && proposal.status !== "DRAFT") {
    return undefined;
  }
  if (capability.status !== "DECLARED" && capability.status !== "DRAFT") {
    return undefined;
  }
  if (query.kind && proposal.kind !== query.kind) return undefined;
  if (query.scope && proposal.scope !== query.scope) return undefined;
  if (query.capabilityKind && capability.kind !== query.capabilityKind) {
    return undefined;
  }

  const proposalKeys = (query.proposalKeys ?? []).map((k) =>
    k.trim().toUpperCase(),
  );
  if (
    proposalKeys.length > 0 &&
    !proposalKeys.includes(proposal.proposalKey)
  ) {
    return undefined;
  }

  if (query.mode === "DECLARED") {
    if (proposalKeys.includes(proposal.proposalKey)) {
      return {
        proposalId: proposal.id,
        proposalKey: proposal.proposalKey,
        kind: proposal.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "PROPOSAL",
      };
    }
    if (query.kind && proposal.kind === query.kind) {
      return {
        proposalId: proposal.id,
        proposalKey: proposal.proposalKey,
        kind: proposal.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "KIND",
      };
    }
    if (query.capabilityKind && capability.kind === query.capabilityKind) {
      return {
        proposalId: proposal.id,
        proposalKey: proposal.proposalKey,
        kind: proposal.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "CAPABILITY",
      };
    }
    if (query.scope && proposal.scope === query.scope) {
      return {
        proposalId: proposal.id,
        proposalKey: proposal.proposalKey,
        kind: proposal.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "SCOPE",
      };
    }
    return undefined;
  }

  if (query.mode === "ROUTINE") {
    if (query.kind && proposal.kind === query.kind) {
      return {
        proposalId: proposal.id,
        proposalKey: proposal.proposalKey,
        kind: proposal.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "KIND",
      };
    }
    return undefined;
  }

  // HANDSHAKE — exact proposal key required
  if (proposalKeys.includes(proposal.proposalKey)) {
    return {
      proposalId: proposal.id,
      proposalKey: proposal.proposalKey,
      kind: proposal.kind,
      capabilityKey: capability.capabilityKey,
      matchedOn: "PROPOSAL",
    };
  }
  return undefined;
}

export function evaluateEvolutionOptimizationEvaluationContract(
  input: EvaluateEvolutionOptimizationEvaluationContractInput,
): EvolutionOptimizationEvaluationContract {
  const contractKey = input.contractKey.trim().toUpperCase();
  if (!contractKey) throw new Error("contract.contractKey is required");
  if (keys.has(contractKey)) {
    throw new Error(`contractKey already exists: ${contractKey}`);
  }
  if (
    !(EVOLUTION_OPTIMIZATION_EVALUATION_MODES as readonly string[]).includes(
      input.query.mode,
    )
  ) {
    throw new Error(`invalid evaluation mode: ${input.query.mode}`);
  }
  const hasFilter =
    Boolean(input.query.kind) ||
    Boolean(input.query.capabilityKind) ||
    Boolean(input.query.scope) ||
    Boolean(input.query.proposalKeys?.length);
  if (!hasFilter) {
    throw new Error(
      "query.kind, query.capabilityKind, query.scope, or query.proposalKeys is required",
    );
  }

  const id = input.id?.trim() || createId("evoptev");
  if (contracts.has(id)) throw new Error(`contract already exists: ${id}`);

  const proposals = listEvolutionOptimizationProposals();
  const proposalById = new Map(proposals.map((p) => [p.id, p]));
  const hits = listEvolutionOptimizationCapabilities()
    .map((capability) => {
      const proposal = proposalById.get(capability.proposalId);
      if (!proposal) return undefined;
      return matchCapability(proposal, capability, input.query);
    })
    .filter((h): h is EvolutionOptimizationEvaluationHit => h !== undefined)
    .sort((a, b) => a.proposalKey.localeCompare(b.proposalKey));

  const contract: EvolutionOptimizationEvaluationContract = {
    id,
    contractKey,
    query: {
      ...input.query,
      queryKey: input.query.queryKey.trim().toUpperCase(),
      proposalKeys: input.query.proposalKeys
        ? input.query.proposalKeys.map((k) => k.trim().toUpperCase())
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

export function getEvolutionOptimizationEvaluationContract(
  id: string,
): EvolutionOptimizationEvaluationContract | undefined {
  const contract = contracts.get(id.trim());
  return contract ? cloneContract(contract) : undefined;
}

export function listEvolutionOptimizationEvaluationContracts(): EvolutionOptimizationEvaluationContract[] {
  return [...contracts.values()]
    .slice()
    .sort((a, b) => a.contractKey.localeCompare(b.contractKey))
    .map(cloneContract);
}

export function clearEvolutionOptimizationEvaluationContracts(): void {
  contracts.clear();
  keys.clear();
}
