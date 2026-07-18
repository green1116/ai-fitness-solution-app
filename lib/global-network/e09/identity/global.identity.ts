/**
 * E09-P1 — Global Identity Layer
 * Identity binding for global network nodes (reuse e09/core node types)
 */

import { GLOBAL_NODE_TYPES } from "../core/global.constants";
import type {
  GlobalNodeMetadata,
  GlobalNodeType,
} from "../core/global.types";

export const GLOBAL_IDENTITY_STATUSES = [
  "ACTIVE",
  "REVOKED",
] as const;

export type GlobalIdentityStatus = (typeof GLOBAL_IDENTITY_STATUSES)[number];

export type GlobalIdentity = {
  id: string;
  nodeId: string;
  type: GlobalNodeType;
  issuer: string;
  trustLevel: number;
  metadata: GlobalNodeMetadata;
  status: GlobalIdentityStatus;
  issuedAt: string;
  revokedAt?: string;
};

export type CreateGlobalIdentityInput = {
  id?: string;
  nodeId: string;
  type: GlobalNodeType;
  issuer: string;
  trustLevel?: number;
  metadata?: GlobalNodeMetadata;
};

export type VerifyGlobalIdentityResult = {
  valid: boolean;
  identityId: string;
  nodeId?: string;
  trustLevel?: number;
  reason: string;
};

const identities = new Map<string, GlobalIdentity>();
const nodeIndex = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function assertIdentityType(type: string): asserts type is GlobalNodeType {
  if (!(GLOBAL_NODE_TYPES as readonly string[]).includes(type)) {
    throw new Error(`invalid identity type: ${type}`);
  }
}

function clampTrustLevel(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error("trustLevel must be a finite number");
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

function cloneIdentity(identity: GlobalIdentity): GlobalIdentity {
  return {
    ...identity,
    metadata: { ...identity.metadata },
  };
}

/** Issue a new identity bound to a global network node. */
export function createIdentity(
  input: CreateGlobalIdentityInput,
): GlobalIdentity {
  const nodeId = input.nodeId.trim();
  const issuer = input.issuer.trim();
  if (!nodeId) throw new Error("nodeId is required");
  if (!issuer) throw new Error("issuer is required");
  assertIdentityType(input.type);

  if (nodeIndex.has(nodeId)) {
    const existingId = nodeIndex.get(nodeId)!;
    const existing = identities.get(existingId);
    if (existing && existing.status === "ACTIVE") {
      throw new Error(`active identity already exists for node: ${nodeId}`);
    }
  }

  const id = input.id?.trim() || createId("gn-id");
  if (identities.has(id)) {
    throw new Error(`identity already exists: ${id}`);
  }

  const identity: GlobalIdentity = {
    id,
    nodeId,
    type: input.type,
    issuer,
    trustLevel: clampTrustLevel(input.trustLevel ?? 50),
    metadata: { ...(input.metadata ?? {}) },
    status: "ACTIVE",
    issuedAt: nowIso(),
  };

  identities.set(id, identity);
  nodeIndex.set(nodeId, id);
  return cloneIdentity(identity);
}

/** Verify an identity is present, active, and meets optional trust floor. */
export function verifyIdentity(
  id: string,
  options?: { minTrustLevel?: number },
): VerifyGlobalIdentityResult {
  const identity = identities.get(id.trim());
  if (!identity) {
    return {
      valid: false,
      identityId: id.trim(),
      reason: "identity not found",
    };
  }

  if (identity.status === "REVOKED") {
    return {
      valid: false,
      identityId: identity.id,
      nodeId: identity.nodeId,
      trustLevel: identity.trustLevel,
      reason: "identity revoked",
    };
  }

  const minTrust = options?.minTrustLevel ?? 0;
  if (identity.trustLevel < minTrust) {
    return {
      valid: false,
      identityId: identity.id,
      nodeId: identity.nodeId,
      trustLevel: identity.trustLevel,
      reason: `trustLevel ${identity.trustLevel} below minimum ${minTrust}`,
    };
  }

  return {
    valid: true,
    identityId: identity.id,
    nodeId: identity.nodeId,
    trustLevel: identity.trustLevel,
    reason: "identity verified",
  };
}

/** Lookup identity by id, or by nodeId when `by: "node"` is set. */
export function getIdentity(
  idOrNodeId: string,
  options?: { by?: "id" | "node" },
): GlobalIdentity | undefined {
  const key = idOrNodeId.trim();
  const by = options?.by ?? "id";

  if (by === "node") {
    const identityId = nodeIndex.get(key);
    if (!identityId) return undefined;
    const identity = identities.get(identityId);
    return identity ? cloneIdentity(identity) : undefined;
  }

  const identity = identities.get(key);
  return identity ? cloneIdentity(identity) : undefined;
}

/** Revoke an active identity. */
export function revokeIdentity(id: string): GlobalIdentity {
  const identity = identities.get(id.trim());
  if (!identity) {
    throw new Error(`identity not found: ${id}`);
  }
  if (identity.status === "REVOKED") {
    throw new Error(`identity already revoked: ${id}`);
  }

  const revoked: GlobalIdentity = {
    ...identity,
    status: "REVOKED",
    revokedAt: nowIso(),
    metadata: { ...identity.metadata },
  };
  identities.set(revoked.id, revoked);
  return cloneIdentity(revoked);
}

export function listIdentities(filter?: {
  type?: GlobalNodeType;
  status?: GlobalIdentityStatus;
  nodeId?: string;
}): GlobalIdentity[] {
  let result = [...identities.values()];
  if (filter?.type) {
    result = result.filter((i) => i.type === filter.type);
  }
  if (filter?.status) {
    result = result.filter((i) => i.status === filter.status);
  }
  if (filter?.nodeId) {
    result = result.filter((i) => i.nodeId === filter.nodeId);
  }
  return result.map(cloneIdentity);
}

export function clearIdentities(): void {
  identities.clear();
  nodeIndex.clear();
}
