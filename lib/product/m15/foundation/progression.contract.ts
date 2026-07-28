/**
 * Product M15 — Evolution progression contract (in-memory, declarative)
 * Declarative match against registered tracks/capabilities — no evolution execution.
 */

import { EVOLUTION_PROGRESSION_MODES } from "./evolution.constants";
import { listEvolutionCapabilities } from "./capability.registry";
import { listEvolutionTracks } from "./evolution.registry";
import type {
  EvaluateEvolutionProgressionContractInput,
  EvolutionCapability,
  EvolutionProgressionContract,
  EvolutionProgressionHit,
  EvolutionProgressionQuery,
  EvolutionTrack,
} from "./evolution.types";

const contracts = new Map<string, EvolutionProgressionContract>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneContract(
  contract: EvolutionProgressionContract,
): EvolutionProgressionContract {
  return {
    ...contract,
    query: {
      ...contract.query,
      trackKeys: contract.query.trackKeys
        ? [...contract.query.trackKeys]
        : undefined,
    },
    hits: contract.hits.map((h) => ({ ...h })),
    metadata: { ...contract.metadata },
  };
}

function matchCapability(
  track: EvolutionTrack,
  capability: EvolutionCapability,
  query: EvolutionProgressionQuery,
): EvolutionProgressionHit | undefined {
  if (track.status !== "ACTIVE" && track.status !== "DRAFT") {
    return undefined;
  }
  if (capability.status !== "DECLARED" && capability.status !== "DRAFT") {
    return undefined;
  }
  if (query.kind && track.kind !== query.kind) return undefined;
  if (query.scope && track.scope !== query.scope) return undefined;
  if (query.capabilityKind && capability.kind !== query.capabilityKind) {
    return undefined;
  }

  const trackKeys = (query.trackKeys ?? []).map((k) => k.trim().toUpperCase());
  if (trackKeys.length > 0 && !trackKeys.includes(track.trackKey)) {
    return undefined;
  }

  if (query.mode === "DECLARED") {
    if (trackKeys.includes(track.trackKey)) {
      return {
        trackId: track.id,
        trackKey: track.trackKey,
        kind: track.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "TRACK",
      };
    }
    if (query.kind && track.kind === query.kind) {
      return {
        trackId: track.id,
        trackKey: track.trackKey,
        kind: track.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "KIND",
      };
    }
    if (query.capabilityKind && capability.kind === query.capabilityKind) {
      return {
        trackId: track.id,
        trackKey: track.trackKey,
        kind: track.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "CAPABILITY",
      };
    }
    if (query.scope && track.scope === query.scope) {
      return {
        trackId: track.id,
        trackKey: track.trackKey,
        kind: track.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "SCOPE",
      };
    }
    return undefined;
  }

  if (query.mode === "ROUTINE") {
    if (query.kind && track.kind === query.kind) {
      return {
        trackId: track.id,
        trackKey: track.trackKey,
        kind: track.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "KIND",
      };
    }
    return undefined;
  }

  // HANDSHAKE — exact track key required
  if (trackKeys.includes(track.trackKey)) {
    return {
      trackId: track.id,
      trackKey: track.trackKey,
      kind: track.kind,
      capabilityKey: capability.capabilityKey,
      matchedOn: "TRACK",
    };
  }
  return undefined;
}

export function evaluateEvolutionProgressionContract(
  input: EvaluateEvolutionProgressionContractInput,
): EvolutionProgressionContract {
  const contractKey = input.contractKey.trim().toUpperCase();
  if (!contractKey) throw new Error("contract.contractKey is required");
  if (keys.has(contractKey)) {
    throw new Error(`contractKey already exists: ${contractKey}`);
  }
  if (
    !(EVOLUTION_PROGRESSION_MODES as readonly string[]).includes(
      input.query.mode,
    )
  ) {
    throw new Error(`invalid progression mode: ${input.query.mode}`);
  }
  const hasFilter =
    Boolean(input.query.kind) ||
    Boolean(input.query.capabilityKind) ||
    Boolean(input.query.scope) ||
    Boolean(input.query.trackKeys?.length);
  if (!hasFilter) {
    throw new Error(
      "query.kind, query.capabilityKind, query.scope, or query.trackKeys is required",
    );
  }

  const id = input.id?.trim() || createId("evoprg");
  if (contracts.has(id)) throw new Error(`contract already exists: ${id}`);

  const tracks = listEvolutionTracks();
  const trackById = new Map(tracks.map((t) => [t.id, t]));
  const hits = listEvolutionCapabilities()
    .map((capability) => {
      const track = trackById.get(capability.trackId);
      if (!track) return undefined;
      return matchCapability(track, capability, input.query);
    })
    .filter((h): h is EvolutionProgressionHit => h !== undefined)
    .sort((a, b) => a.trackKey.localeCompare(b.trackKey));

  const contract: EvolutionProgressionContract = {
    id,
    contractKey,
    query: {
      ...input.query,
      queryKey: input.query.queryKey.trim().toUpperCase(),
      trackKeys: input.query.trackKeys
        ? input.query.trackKeys.map((k) => k.trim().toUpperCase())
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

export function getEvolutionProgressionContract(
  id: string,
): EvolutionProgressionContract | undefined {
  const contract = contracts.get(id.trim());
  return contract ? cloneContract(contract) : undefined;
}

export function listEvolutionProgressionContracts(): EvolutionProgressionContract[] {
  return [...contracts.values()]
    .slice()
    .sort((a, b) => a.contractKey.localeCompare(b.contractKey))
    .map(cloneContract);
}

export function clearEvolutionProgressionContracts(): void {
  contracts.clear();
  keys.clear();
}
