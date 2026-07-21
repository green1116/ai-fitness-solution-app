/**
 * E10-P3 — Resource Allocation / Release
 */

import {
  adjustPoolReserved,
  availableInPool,
  getPool,
} from "./resource.pool";
import {
  adjustQuotaUsed,
  availableInQuota,
  getQuota,
} from "./resource.quota";
import type {
  AllocateResourceInput,
  AllocationStatus,
  ResourceAllocation,
} from "./resource.types";

const allocations = new Map<string, ResourceAllocation>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAllocation(
  allocation: ResourceAllocation,
): ResourceAllocation {
  return {
    ...allocation,
    metadata: { ...allocation.metadata },
  };
}

function assertAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("allocation.amount must be a finite number > 0");
  }
}

/** Allocate from an OPEN pool, optionally enforcing a quota. */
export function allocateResource(
  input: AllocateResourceInput,
): ResourceAllocation {
  const poolId = input.poolId.trim();
  const ownerId = input.ownerId.trim();
  if (!poolId) throw new Error("allocation.poolId is required");
  if (!ownerId) throw new Error("allocation.ownerId is required");
  assertAmount(input.amount);

  const id = input.id?.trim() || createId("res-alloc");
  if (allocations.has(id)) {
    throw new Error(`allocation already exists: ${id}`);
  }

  const pool = getPool(poolId);
  if (!pool) throw new Error(`resource pool not found: ${poolId}`);
  if (pool.status !== "OPEN") {
    const denied: ResourceAllocation = {
      id,
      poolId,
      ownerId,
      type: pool.type,
      amount: input.amount,
      status: "DENIED",
      quotaId: input.quotaId?.trim() || undefined,
      allocatedAt: nowIso(),
      reason: `pool status is ${pool.status}`,
      metadata: { ...(input.metadata ?? {}) },
    };
    allocations.set(id, denied);
    return cloneAllocation(denied);
  }

  if (availableInPool(poolId) < input.amount) {
    const denied: ResourceAllocation = {
      id,
      poolId,
      ownerId,
      type: pool.type,
      amount: input.amount,
      status: "DENIED",
      quotaId: input.quotaId?.trim() || undefined,
      allocatedAt: nowIso(),
      reason: "insufficient pool capacity",
      metadata: { ...(input.metadata ?? {}) },
    };
    allocations.set(id, denied);
    return cloneAllocation(denied);
  }

  const quotaId = input.quotaId?.trim();
  if (quotaId) {
    const quota = getQuota(quotaId);
    if (!quota) throw new Error(`resource quota not found: ${quotaId}`);
    if (quota.ownerId !== ownerId) {
      throw new Error(
        `quota owner mismatch: ${quota.ownerId} ≠ ${ownerId}`,
      );
    }
    if (quota.type !== pool.type) {
      throw new Error(
        `quota type mismatch: ${quota.type} ≠ ${pool.type}`,
      );
    }
    if (availableInQuota(quotaId) < input.amount) {
      const denied: ResourceAllocation = {
        id,
        poolId,
        ownerId,
        type: pool.type,
        amount: input.amount,
        status: "DENIED",
        quotaId,
        allocatedAt: nowIso(),
        reason: "quota exceeded",
        metadata: { ...(input.metadata ?? {}) },
      };
      allocations.set(id, denied);
      return cloneAllocation(denied);
    }
  }

  adjustPoolReserved(poolId, input.amount);
  if (quotaId) {
    adjustQuotaUsed(quotaId, input.amount);
  }

  const allocation: ResourceAllocation = {
    id,
    poolId,
    ownerId,
    type: pool.type,
    amount: input.amount,
    status: "ACTIVE",
    quotaId: quotaId || undefined,
    allocatedAt: nowIso(),
    metadata: { ...(input.metadata ?? {}) },
  };
  allocations.set(id, allocation);
  return cloneAllocation(allocation);
}

/** Release an ACTIVE allocation back to pool (+ quota). */
export function releaseResource(allocationId: string): ResourceAllocation {
  const allocation = allocations.get(allocationId.trim());
  if (!allocation) {
    throw new Error(`allocation not found: ${allocationId}`);
  }
  if (allocation.status !== "ACTIVE") {
    throw new Error(
      `release requires ACTIVE allocation (current=${allocation.status})`,
    );
  }

  adjustPoolReserved(allocation.poolId, -allocation.amount);
  if (allocation.quotaId) {
    adjustQuotaUsed(allocation.quotaId, -allocation.amount);
  }

  const released: ResourceAllocation = {
    ...allocation,
    status: "RELEASED",
    releasedAt: nowIso(),
    metadata: { ...allocation.metadata },
  };
  allocations.set(released.id, released);
  return cloneAllocation(released);
}

export function getAllocation(
  id: string,
): ResourceAllocation | undefined {
  const allocation = allocations.get(id.trim());
  return allocation ? cloneAllocation(allocation) : undefined;
}

export function listAllocations(filter?: {
  status?: AllocationStatus;
  poolId?: string;
  ownerId?: string;
  type?: ResourceAllocation["type"];
}): ResourceAllocation[] {
  let result = [...allocations.values()];
  if (filter?.status) {
    result = result.filter((a) => a.status === filter.status);
  }
  if (filter?.poolId) {
    const poolId = filter.poolId.trim();
    result = result.filter((a) => a.poolId === poolId);
  }
  if (filter?.ownerId) {
    const ownerId = filter.ownerId.trim();
    result = result.filter((a) => a.ownerId === ownerId);
  }
  if (filter?.type) {
    result = result.filter((a) => a.type === filter.type);
  }
  return result
    .slice()
    .sort((a, b) => a.allocatedAt.localeCompare(b.allocatedAt) || a.id.localeCompare(b.id))
    .map(cloneAllocation);
}

export function clearAllocations(): void {
  allocations.clear();
}
