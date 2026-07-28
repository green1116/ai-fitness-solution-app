/**
 * Product M14 — Intelligence analysis contract (in-memory, declarative)
 * Declarative match against registered lenses/capabilities — no intelligence execution.
 */

import { INTELLIGENCE_ANALYSIS_MODES } from "./intelligence.constants";
import { listIntelligenceCapabilities } from "./capability.registry";
import { listIntelligenceLenses } from "./intelligence.registry";
import type {
  EvaluateIntelligenceAnalysisContractInput,
  IntelligenceAnalysisContract,
  IntelligenceAnalysisHit,
  IntelligenceAnalysisQuery,
  IntelligenceCapability,
  IntelligenceLens,
} from "./intelligence.types";

const contracts = new Map<string, IntelligenceAnalysisContract>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneContract(
  contract: IntelligenceAnalysisContract,
): IntelligenceAnalysisContract {
  return {
    ...contract,
    query: {
      ...contract.query,
      lensKeys: contract.query.lensKeys
        ? [...contract.query.lensKeys]
        : undefined,
    },
    hits: contract.hits.map((h) => ({ ...h })),
    metadata: { ...contract.metadata },
  };
}

function matchCapability(
  lens: IntelligenceLens,
  capability: IntelligenceCapability,
  query: IntelligenceAnalysisQuery,
): IntelligenceAnalysisHit | undefined {
  if (lens.status !== "ACTIVE" && lens.status !== "DRAFT") {
    return undefined;
  }
  if (capability.status !== "DECLARED" && capability.status !== "DRAFT") {
    return undefined;
  }
  if (query.kind && lens.kind !== query.kind) return undefined;
  if (query.scope && lens.scope !== query.scope) return undefined;
  if (query.capabilityKind && capability.kind !== query.capabilityKind) {
    return undefined;
  }

  const lensKeys = (query.lensKeys ?? []).map((k) => k.trim().toUpperCase());
  if (lensKeys.length > 0 && !lensKeys.includes(lens.lensKey)) {
    return undefined;
  }

  if (query.mode === "DECLARED") {
    if (lensKeys.includes(lens.lensKey)) {
      return {
        lensId: lens.id,
        lensKey: lens.lensKey,
        kind: lens.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "LENS",
      };
    }
    if (query.kind && lens.kind === query.kind) {
      return {
        lensId: lens.id,
        lensKey: lens.lensKey,
        kind: lens.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "KIND",
      };
    }
    if (query.capabilityKind && capability.kind === query.capabilityKind) {
      return {
        lensId: lens.id,
        lensKey: lens.lensKey,
        kind: lens.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "CAPABILITY",
      };
    }
    if (query.scope && lens.scope === query.scope) {
      return {
        lensId: lens.id,
        lensKey: lens.lensKey,
        kind: lens.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "SCOPE",
      };
    }
    return undefined;
  }

  if (query.mode === "ROUTINE") {
    if (query.kind && lens.kind === query.kind) {
      return {
        lensId: lens.id,
        lensKey: lens.lensKey,
        kind: lens.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "KIND",
      };
    }
    return undefined;
  }

  // HANDSHAKE — exact lens key required
  if (lensKeys.includes(lens.lensKey)) {
    return {
      lensId: lens.id,
      lensKey: lens.lensKey,
      kind: lens.kind,
      capabilityKey: capability.capabilityKey,
      matchedOn: "LENS",
    };
  }
  return undefined;
}

export function evaluateIntelligenceAnalysisContract(
  input: EvaluateIntelligenceAnalysisContractInput,
): IntelligenceAnalysisContract {
  const contractKey = input.contractKey.trim().toUpperCase();
  if (!contractKey) throw new Error("contract.contractKey is required");
  if (keys.has(contractKey)) {
    throw new Error(`contractKey already exists: ${contractKey}`);
  }
  if (
    !(INTELLIGENCE_ANALYSIS_MODES as readonly string[]).includes(
      input.query.mode,
    )
  ) {
    throw new Error(`invalid analysis mode: ${input.query.mode}`);
  }
  const hasFilter =
    Boolean(input.query.kind) ||
    Boolean(input.query.capabilityKind) ||
    Boolean(input.query.scope) ||
    Boolean(input.query.lensKeys?.length);
  if (!hasFilter) {
    throw new Error(
      "query.kind, query.capabilityKind, query.scope, or query.lensKeys is required",
    );
  }

  const id = input.id?.trim() || createId("intan");
  if (contracts.has(id)) throw new Error(`contract already exists: ${id}`);

  const lenses = listIntelligenceLenses();
  const lensById = new Map(lenses.map((l) => [l.id, l]));
  const hits = listIntelligenceCapabilities()
    .map((capability) => {
      const lens = lensById.get(capability.lensId);
      if (!lens) return undefined;
      return matchCapability(lens, capability, input.query);
    })
    .filter((h): h is IntelligenceAnalysisHit => h !== undefined)
    .sort((a, b) => a.lensKey.localeCompare(b.lensKey));

  const contract: IntelligenceAnalysisContract = {
    id,
    contractKey,
    query: {
      ...input.query,
      queryKey: input.query.queryKey.trim().toUpperCase(),
      lensKeys: input.query.lensKeys
        ? input.query.lensKeys.map((k) => k.trim().toUpperCase())
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

export function getIntelligenceAnalysisContract(
  id: string,
): IntelligenceAnalysisContract | undefined {
  const contract = contracts.get(id.trim());
  return contract ? cloneContract(contract) : undefined;
}

export function listIntelligenceAnalysisContracts(): IntelligenceAnalysisContract[] {
  return [...contracts.values()]
    .slice()
    .sort((a, b) => a.contractKey.localeCompare(b.contractKey))
    .map(cloneContract);
}

export function clearIntelligenceAnalysisContracts(): void {
  contracts.clear();
  keys.clear();
}
