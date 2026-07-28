/**
 * Product M15 — Evolution capability advancement contract (in-memory, declarative)
 * Declarative match against registered capability specs/revisions —
 * no deployment / execution / runtime activation.
 */

import { EVOLUTION_CAPABILITY_ADVANCEMENT_MODES } from "./capability.constants";
import { listEvolutionCapabilitySpecs } from "./capability.registry";
import { listEvolutionCapabilityRevisions } from "./revision.registry";
import type {
  EvaluateEvolutionCapabilityAdvancementContractInput,
  EvolutionCapabilityAdvancementContract,
  EvolutionCapabilityAdvancementHit,
  EvolutionCapabilityAdvancementQuery,
  EvolutionCapabilityRevision,
  EvolutionCapabilitySpec,
} from "./capability.types";

const contracts = new Map<string, EvolutionCapabilityAdvancementContract>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneContract(
  contract: EvolutionCapabilityAdvancementContract,
): EvolutionCapabilityAdvancementContract {
  return {
    ...contract,
    query: {
      ...contract.query,
      capabilityKeys: contract.query.capabilityKeys
        ? [...contract.query.capabilityKeys]
        : undefined,
    },
    hits: contract.hits.map((h) => ({ ...h })),
    metadata: { ...contract.metadata },
  };
}

function matchRevision(
  capability: EvolutionCapabilitySpec,
  revision: EvolutionCapabilityRevision,
  query: EvolutionCapabilityAdvancementQuery,
): EvolutionCapabilityAdvancementHit | undefined {
  if (capability.status !== "ACTIVE" && capability.status !== "DRAFT") {
    return undefined;
  }
  if (revision.status !== "DECLARED" && revision.status !== "DRAFT") {
    return undefined;
  }
  if (query.kind && capability.kind !== query.kind) return undefined;
  if (query.scope && capability.scope !== query.scope) return undefined;
  if (query.revisionKind && revision.kind !== query.revisionKind) {
    return undefined;
  }

  const capabilityKeys = (query.capabilityKeys ?? []).map((k) =>
    k.trim().toUpperCase(),
  );
  if (
    capabilityKeys.length > 0 &&
    !capabilityKeys.includes(capability.capabilityKey)
  ) {
    return undefined;
  }

  if (query.mode === "DECLARED") {
    if (capabilityKeys.includes(capability.capabilityKey)) {
      return {
        capabilityId: capability.id,
        capabilityKey: capability.capabilityKey,
        kind: capability.kind,
        revisionKey: revision.revisionKey,
        matchedOn: "CAPABILITY",
      };
    }
    if (query.kind && capability.kind === query.kind) {
      return {
        capabilityId: capability.id,
        capabilityKey: capability.capabilityKey,
        kind: capability.kind,
        revisionKey: revision.revisionKey,
        matchedOn: "KIND",
      };
    }
    if (query.revisionKind && revision.kind === query.revisionKind) {
      return {
        capabilityId: capability.id,
        capabilityKey: capability.capabilityKey,
        kind: capability.kind,
        revisionKey: revision.revisionKey,
        matchedOn: "REVISION",
      };
    }
    if (query.scope && capability.scope === query.scope) {
      return {
        capabilityId: capability.id,
        capabilityKey: capability.capabilityKey,
        kind: capability.kind,
        revisionKey: revision.revisionKey,
        matchedOn: "SCOPE",
      };
    }
    return undefined;
  }

  if (query.mode === "ROUTINE") {
    if (query.kind && capability.kind === query.kind) {
      return {
        capabilityId: capability.id,
        capabilityKey: capability.capabilityKey,
        kind: capability.kind,
        revisionKey: revision.revisionKey,
        matchedOn: "KIND",
      };
    }
    return undefined;
  }

  // HANDSHAKE — exact capability key required
  if (capabilityKeys.includes(capability.capabilityKey)) {
    return {
      capabilityId: capability.id,
      capabilityKey: capability.capabilityKey,
      kind: capability.kind,
      revisionKey: revision.revisionKey,
      matchedOn: "CAPABILITY",
    };
  }
  return undefined;
}

export function evaluateEvolutionCapabilityAdvancementContract(
  input: EvaluateEvolutionCapabilityAdvancementContractInput,
): EvolutionCapabilityAdvancementContract {
  const contractKey = input.contractKey.trim().toUpperCase();
  if (!contractKey) throw new Error("contract.contractKey is required");
  if (keys.has(contractKey)) {
    throw new Error(`contractKey already exists: ${contractKey}`);
  }
  if (
    !(EVOLUTION_CAPABILITY_ADVANCEMENT_MODES as readonly string[]).includes(
      input.query.mode,
    )
  ) {
    throw new Error(`invalid advancement mode: ${input.query.mode}`);
  }
  const hasFilter =
    Boolean(input.query.kind) ||
    Boolean(input.query.revisionKind) ||
    Boolean(input.query.scope) ||
    Boolean(input.query.capabilityKeys?.length);
  if (!hasFilter) {
    throw new Error(
      "query.kind, query.revisionKind, query.scope, or query.capabilityKeys is required",
    );
  }

  const id = input.id?.trim() || createId("evocapadv");
  if (contracts.has(id)) throw new Error(`contract already exists: ${id}`);

  const capabilities = listEvolutionCapabilitySpecs();
  const capabilityById = new Map(capabilities.map((c) => [c.id, c]));
  const hits = listEvolutionCapabilityRevisions()
    .map((revision) => {
      const capability = capabilityById.get(revision.capabilityId);
      if (!capability) return undefined;
      return matchRevision(capability, revision, input.query);
    })
    .filter((h): h is EvolutionCapabilityAdvancementHit => h !== undefined)
    .sort((a, b) => a.capabilityKey.localeCompare(b.capabilityKey));

  const contract: EvolutionCapabilityAdvancementContract = {
    id,
    contractKey,
    query: {
      ...input.query,
      queryKey: input.query.queryKey.trim().toUpperCase(),
      capabilityKeys: input.query.capabilityKeys
        ? input.query.capabilityKeys.map((k) => k.trim().toUpperCase())
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

export function getEvolutionCapabilityAdvancementContract(
  id: string,
): EvolutionCapabilityAdvancementContract | undefined {
  const contract = contracts.get(id.trim());
  return contract ? cloneContract(contract) : undefined;
}

export function listEvolutionCapabilityAdvancementContracts(): EvolutionCapabilityAdvancementContract[] {
  return [...contracts.values()]
    .slice()
    .sort((a, b) => a.contractKey.localeCompare(b.contractKey))
    .map(cloneContract);
}

export function clearEvolutionCapabilityAdvancementContracts(): void {
  contracts.clear();
  keys.clear();
}
