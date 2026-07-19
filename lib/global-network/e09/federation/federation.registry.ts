/**
 * E09-P4 — Federation Registry
 * Registers federated identities bound to e09/identity GlobalIdentity
 */

import {
  getIdentity,
  type GlobalIdentity,
} from "../identity/global.identity";
import {
  E09_FEDERATION_BASE,
  E09_FEDERATION_FREEZE_VERSION,
  E09_FEDERATION_ID,
  E09_FEDERATION_VERSION,
  FEDERATION_SCOPES,
  FEDERATION_STATUSES,
} from "./federation.constants";
import type {
  FederatedIdentity,
  FederationRegistryManifest,
  FederationScope,
  FederationStatus,
  RegisterFederationInput,
} from "./federation.types";

const federations = new Map<string, FederatedIdentity>();
/** identityId → federation ids */
const identityIndex = new Map<string, string[]>();
/** ownerNodeId → federation ids */
const nodeIndex = new Map<string, string[]>();

function cloneFederation(entry: FederatedIdentity): FederatedIdentity {
  return { ...entry };
}

function assertScope(scope: string): asserts scope is FederationScope {
  if (!(FEDERATION_SCOPES as readonly string[]).includes(scope)) {
    throw new Error(`invalid federation scope: ${scope}`);
  }
}

function assertStatus(status: string): asserts status is FederationStatus {
  if (!(FEDERATION_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid federation status: ${status}`);
  }
}

function clampTrustLevel(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error("trustLevel must be a finite number");
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

function pushIndex(map: Map<string, string[]>, key: string, id: string): void {
  const list = map.get(key) ?? [];
  if (!list.includes(id)) map.set(key, [...list, id]);
}

function dropIndex(map: Map<string, string[]>, key: string, id: string): void {
  const list = map.get(key) ?? [];
  const next = list.filter((x) => x !== id);
  if (next.length === 0) map.delete(key);
  else map.set(key, next);
}

function indexFederation(entry: FederatedIdentity): void {
  pushIndex(identityIndex, entry.identityId, entry.id);
  pushIndex(nodeIndex, entry.ownerNodeId, entry.id);
}

function unindexFederation(entry: FederatedIdentity): void {
  dropIndex(identityIndex, entry.identityId, entry.id);
  dropIndex(nodeIndex, entry.ownerNodeId, entry.id);
}

function resolveIdentity(identityId: string): GlobalIdentity {
  const id = identityId.trim();
  if (!id) throw new Error("federation.identityId is required");
  const identity = getIdentity(id);
  if (!identity) {
    throw new Error(`identity not found: ${id}`);
  }
  if (identity.status === "REVOKED") {
    throw new Error(`identity is revoked: ${id}`);
  }
  return identity;
}

/** Register a federated identity binding over an active GlobalIdentity. */
export function registerFederation(
  input: RegisterFederationInput,
): FederatedIdentity {
  const id = input.id.trim();
  if (!id) throw new Error("federation.id is required");
  assertScope(input.scope);

  const identity = resolveIdentity(input.identityId);
  const ownerNodeId = (input.ownerNodeId ?? identity.nodeId).trim();
  if (!ownerNodeId) throw new Error("federation.ownerNodeId is required");
  if (ownerNodeId !== identity.nodeId) {
    throw new Error(
      `ownerNodeId ${ownerNodeId} does not match identity.nodeId ${identity.nodeId}`,
    );
  }

  const status = input.status ?? "ACTIVE";
  assertStatus(status);

  const trustLevel = clampTrustLevel(
    input.trustLevel ?? identity.trustLevel,
  );

  if (federations.has(id)) {
    throw new Error(`federation already registered: ${id}`);
  }

  // One ACTIVE federation per identity+scope
  const existingForIdentity = identityIndex.get(identity.id) ?? [];
  for (const existingId of existingForIdentity) {
    const existing = federations.get(existingId);
    if (
      existing &&
      existing.scope === input.scope &&
      existing.status === "ACTIVE"
    ) {
      throw new Error(
        `active federation already exists for identity ${identity.id} scope ${input.scope}`,
      );
    }
  }

  const entry: FederatedIdentity = {
    id,
    identityId: identity.id,
    ownerNodeId,
    scope: input.scope,
    trustLevel,
    status,
  };

  federations.set(id, entry);
  indexFederation(entry);
  return cloneFederation(entry);
}

export function getFederation(id: string): FederatedIdentity | undefined {
  const entry = federations.get(id.trim());
  return entry ? cloneFederation(entry) : undefined;
}

export function listFederations(filter?: {
  status?: FederationStatus;
  scope?: FederationScope;
  identityId?: string;
  ownerNodeId?: string;
}): FederatedIdentity[] {
  let result: FederatedIdentity[];

  if (filter?.identityId) {
    const ids = identityIndex.get(filter.identityId.trim()) ?? [];
    result = ids
      .map((id) => federations.get(id))
      .filter((e): e is FederatedIdentity => Boolean(e));
  } else if (filter?.ownerNodeId) {
    const ids = nodeIndex.get(filter.ownerNodeId.trim()) ?? [];
    result = ids
      .map((id) => federations.get(id))
      .filter((e): e is FederatedIdentity => Boolean(e));
  } else {
    result = [...federations.values()];
  }

  if (filter?.status) {
    result = result.filter((e) => e.status === filter.status);
  }
  if (filter?.scope) {
    result = result.filter((e) => e.scope === filter.scope);
  }

  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneFederation);
}

export function removeFederation(id: string): boolean {
  const entry = federations.get(id.trim());
  if (!entry) return false;
  unindexFederation(entry);
  federations.delete(entry.id);
  return true;
}

export function buildFederationRegistryManifest(): FederationRegistryManifest {
  const list = listFederations();
  return {
    federationId: E09_FEDERATION_ID,
    version: E09_FEDERATION_VERSION,
    freezeVersion: E09_FEDERATION_FREEZE_VERSION,
    base: E09_FEDERATION_BASE,
    federationCount: list.length,
    federations: list,
  };
}

export function clearFederations(): void {
  federations.clear();
  identityIndex.clear();
  nodeIndex.clear();
}
