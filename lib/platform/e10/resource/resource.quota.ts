/**
 * E10-P3 — Resource Quota Model
 */

import { RESOURCE_TYPES } from "./resource.constants";
import type {
  CreateResourceQuotaInput,
  ResourceQuota,
  ResourceType,
} from "./resource.types";

const quotas = new Map<string, ResourceQuota>();
/** ownerId::type → quotaId */
const ownerTypeIndex = new Map<string, string>();

function ownerTypeKey(ownerId: string, type: ResourceType): string {
  return `${ownerId}::${type}`;
}

function cloneQuota(quota: ResourceQuota): ResourceQuota {
  return {
    ...quota,
    metadata: { ...quota.metadata },
  };
}

function assertType(type: string): asserts type is ResourceType {
  if (!(RESOURCE_TYPES as readonly string[]).includes(type)) {
    throw new Error(`invalid resource type: ${type}`);
  }
}

function assertLimit(limit: number): void {
  if (!Number.isFinite(limit) || limit < 0) {
    throw new Error("quota.limit must be a finite number >= 0");
  }
}

export function createQuota(input: CreateResourceQuotaInput): ResourceQuota {
  const id = input.id.trim();
  const ownerId = input.ownerId.trim();
  if (!id) throw new Error("quota.id is required");
  if (!ownerId) throw new Error("quota.ownerId is required");
  assertType(input.type);
  assertLimit(input.limit);

  if (quotas.has(id)) {
    throw new Error(`resource quota already exists: ${id}`);
  }

  const key = ownerTypeKey(ownerId, input.type);
  if (ownerTypeIndex.has(key)) {
    throw new Error(
      `quota already exists for owner ${ownerId} type ${input.type}`,
    );
  }

  const quota: ResourceQuota = {
    id,
    ownerId,
    type: input.type,
    limit: input.limit,
    used: 0,
    metadata: { ...(input.metadata ?? {}) },
  };

  quotas.set(id, quota);
  ownerTypeIndex.set(key, id);
  return cloneQuota(quota);
}

export function getQuota(id: string): ResourceQuota | undefined {
  const quota = quotas.get(id.trim());
  return quota ? cloneQuota(quota) : undefined;
}

export function getQuotaByOwner(
  ownerId: string,
  type: ResourceType,
): ResourceQuota | undefined {
  const id = ownerTypeIndex.get(ownerTypeKey(ownerId.trim(), type));
  if (!id) return undefined;
  return getQuota(id);
}

export function listQuotas(filter?: {
  ownerId?: string;
  type?: ResourceType;
}): ResourceQuota[] {
  let result = [...quotas.values()];
  if (filter?.ownerId) {
    const ownerId = filter.ownerId.trim();
    result = result.filter((q) => q.ownerId === ownerId);
  }
  if (filter?.type) {
    result = result.filter((q) => q.type === filter.type);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneQuota);
}

export function adjustQuotaUsed(id: string, delta: number): ResourceQuota {
  const quota = quotas.get(id.trim());
  if (!quota) throw new Error(`resource quota not found: ${id}`);
  if (!Number.isFinite(delta)) {
    throw new Error("quota used delta must be a finite number");
  }

  const next = quota.used + delta;
  if (next < 0) {
    throw new Error(`quota used cannot go negative: ${id}`);
  }
  if (next > quota.limit) {
    throw new Error(
      `quota exceeded for ${id}: ${quota.used}+${delta} > ${quota.limit}`,
    );
  }

  quota.used = next;
  quotas.set(quota.id, quota);
  return cloneQuota(quota);
}

export function availableInQuota(id: string): number {
  const quota = getQuota(id);
  if (!quota) throw new Error(`resource quota not found: ${id}`);
  return quota.limit - quota.used;
}

export function removeQuota(id: string): boolean {
  const quota = quotas.get(id.trim());
  if (!quota) return false;
  if (quota.used > 0) {
    throw new Error(`cannot remove quota with used resources: ${id}`);
  }
  ownerTypeIndex.delete(ownerTypeKey(quota.ownerId, quota.type));
  return quotas.delete(quota.id);
}

export function clearQuotas(): void {
  quotas.clear();
  ownerTypeIndex.clear();
}
