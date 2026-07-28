/**
 * Product M13 — OS operation contract (in-memory, declarative)
 * Declarative match against registered surfaces/capabilities — no OS execution.
 */

import { OS_OPERATION_MODES } from "./os.constants";
import { listOsCapabilities } from "./capability.registry";
import { listOsSurfaces } from "./os.registry";
import type {
  EvaluateOsOperationContractInput,
  OsCapability,
  OsOperationContract,
  OsOperationHit,
  OsOperationQuery,
  OsSurface,
} from "./os.types";

const contracts = new Map<string, OsOperationContract>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneContract(contract: OsOperationContract): OsOperationContract {
  return {
    ...contract,
    query: {
      ...contract.query,
      surfaceKeys: contract.query.surfaceKeys
        ? [...contract.query.surfaceKeys]
        : undefined,
    },
    hits: contract.hits.map((h) => ({ ...h })),
    metadata: { ...contract.metadata },
  };
}

function matchCapability(
  surface: OsSurface,
  capability: OsCapability,
  query: OsOperationQuery,
): OsOperationHit | undefined {
  if (surface.status !== "ACTIVE" && surface.status !== "DRAFT") {
    return undefined;
  }
  if (capability.status !== "DECLARED" && capability.status !== "DRAFT") {
    return undefined;
  }
  if (query.kind && surface.kind !== query.kind) return undefined;
  if (query.scope && surface.scope !== query.scope) return undefined;
  if (query.capabilityKind && capability.kind !== query.capabilityKind) {
    return undefined;
  }

  const surfaceKeys = (query.surfaceKeys ?? []).map((k) =>
    k.trim().toUpperCase(),
  );
  if (surfaceKeys.length > 0 && !surfaceKeys.includes(surface.surfaceKey)) {
    return undefined;
  }

  if (query.mode === "DECLARED") {
    if (surfaceKeys.includes(surface.surfaceKey)) {
      return {
        surfaceId: surface.id,
        surfaceKey: surface.surfaceKey,
        kind: surface.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "SURFACE",
      };
    }
    if (query.kind && surface.kind === query.kind) {
      return {
        surfaceId: surface.id,
        surfaceKey: surface.surfaceKey,
        kind: surface.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "KIND",
      };
    }
    if (query.capabilityKind && capability.kind === query.capabilityKind) {
      return {
        surfaceId: surface.id,
        surfaceKey: surface.surfaceKey,
        kind: surface.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "CAPABILITY",
      };
    }
    if (query.scope && surface.scope === query.scope) {
      return {
        surfaceId: surface.id,
        surfaceKey: surface.surfaceKey,
        kind: surface.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "SCOPE",
      };
    }
    return undefined;
  }

  if (query.mode === "ROUTINE") {
    if (query.kind && surface.kind === query.kind) {
      return {
        surfaceId: surface.id,
        surfaceKey: surface.surfaceKey,
        kind: surface.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "KIND",
      };
    }
    return undefined;
  }

  // HANDSHAKE — exact surface key required
  if (surfaceKeys.includes(surface.surfaceKey)) {
    return {
      surfaceId: surface.id,
      surfaceKey: surface.surfaceKey,
      kind: surface.kind,
      capabilityKey: capability.capabilityKey,
      matchedOn: "SURFACE",
    };
  }
  return undefined;
}

export function evaluateOsOperationContract(
  input: EvaluateOsOperationContractInput,
): OsOperationContract {
  const contractKey = input.contractKey.trim().toUpperCase();
  if (!contractKey) throw new Error("contract.contractKey is required");
  if (keys.has(contractKey)) {
    throw new Error(`contractKey already exists: ${contractKey}`);
  }
  if (
    !(OS_OPERATION_MODES as readonly string[]).includes(input.query.mode)
  ) {
    throw new Error(`invalid operation mode: ${input.query.mode}`);
  }
  const hasFilter =
    Boolean(input.query.kind) ||
    Boolean(input.query.capabilityKind) ||
    Boolean(input.query.scope) ||
    Boolean(input.query.surfaceKeys?.length);
  if (!hasFilter) {
    throw new Error(
      "query.kind, query.capabilityKind, query.scope, or query.surfaceKeys is required",
    );
  }

  const id = input.id?.trim() || createId("osop");
  if (contracts.has(id)) throw new Error(`contract already exists: ${id}`);

  const surfaces = listOsSurfaces();
  const surfaceById = new Map(surfaces.map((s) => [s.id, s]));
  const hits = listOsCapabilities()
    .map((capability) => {
      const surface = surfaceById.get(capability.surfaceId);
      if (!surface) return undefined;
      return matchCapability(surface, capability, input.query);
    })
    .filter((h): h is OsOperationHit => h !== undefined)
    .sort((a, b) => a.surfaceKey.localeCompare(b.surfaceKey));

  const contract: OsOperationContract = {
    id,
    contractKey,
    query: {
      ...input.query,
      queryKey: input.query.queryKey.trim().toUpperCase(),
      surfaceKeys: input.query.surfaceKeys
        ? input.query.surfaceKeys.map((k) => k.trim().toUpperCase())
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

export function getOsOperationContract(
  id: string,
): OsOperationContract | undefined {
  const contract = contracts.get(id.trim());
  return contract ? cloneContract(contract) : undefined;
}

export function listOsOperationContracts(): OsOperationContract[] {
  return [...contracts.values()]
    .slice()
    .sort((a, b) => a.contractKey.localeCompare(b.contractKey))
    .map(cloneContract);
}

export function clearOsOperationContracts(): void {
  contracts.clear();
  keys.clear();
}
