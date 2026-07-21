/**
 * E10-P3 — Resource Pool Registry
 */

import { getService } from "../runtime/runtime.registry";
import {
  E10_RESOURCE_BASE,
  E10_RESOURCE_FREEZE_VERSION,
  E10_RESOURCE_ID,
  E10_RESOURCE_VERSION,
  RESOURCE_POOL_STATUSES,
  RESOURCE_TYPES,
} from "./resource.constants";
import type {
  CreateResourcePoolInput,
  ResourcePool,
  ResourcePoolStatus,
  ResourceRegistryManifest,
  ResourceType,
} from "./resource.types";

const pools = new Map<string, ResourcePool>();

function clonePool(pool: ResourcePool): ResourcePool {
  return {
    ...pool,
    metadata: { ...pool.metadata },
  };
}

function assertType(type: string): asserts type is ResourceType {
  if (!(RESOURCE_TYPES as readonly string[]).includes(type)) {
    throw new Error(`invalid resource type: ${type}`);
  }
}

function assertPoolStatus(
  status: string,
): asserts status is ResourcePoolStatus {
  if (!(RESOURCE_POOL_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid resource pool status: ${status}`);
  }
}

function assertCapacity(capacity: number): void {
  if (!Number.isFinite(capacity) || capacity <= 0) {
    throw new Error("pool.capacity must be a finite number > 0");
  }
}

export function createPool(input: CreateResourcePoolInput): ResourcePool {
  const id = input.id.trim();
  const name = input.name.trim();
  if (!id) throw new Error("pool.id is required");
  if (!name) throw new Error("pool.name is required");
  assertType(input.type);
  assertCapacity(input.capacity);

  if (pools.has(id)) {
    throw new Error(`resource pool already exists: ${id}`);
  }

  const serviceId = input.serviceId?.trim();
  if (serviceId && !getService(serviceId)) {
    throw new Error(`runtime service not found: ${serviceId}`);
  }

  const pool: ResourcePool = {
    id,
    name,
    type: input.type,
    capacity: input.capacity,
    reserved: 0,
    status: "OPEN",
    serviceId: serviceId || undefined,
    metadata: { ...(input.metadata ?? {}) },
  };

  pools.set(id, pool);
  return clonePool(pool);
}

export function getPool(id: string): ResourcePool | undefined {
  const pool = pools.get(id.trim());
  return pool ? clonePool(pool) : undefined;
}

export function listPools(filter?: {
  type?: ResourceType;
  status?: ResourcePoolStatus;
  serviceId?: string;
}): ResourcePool[] {
  let result = [...pools.values()];
  if (filter?.type) {
    result = result.filter((p) => p.type === filter.type);
  }
  if (filter?.status) {
    result = result.filter((p) => p.status === filter.status);
  }
  if (filter?.serviceId) {
    const serviceId = filter.serviceId.trim();
    result = result.filter((p) => p.serviceId === serviceId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePool);
}

export function setPoolStatus(
  id: string,
  status: ResourcePoolStatus,
): ResourcePool {
  const pool = pools.get(id.trim());
  if (!pool) throw new Error(`resource pool not found: ${id}`);
  assertPoolStatus(status);
  pool.status = status;
  pools.set(pool.id, pool);
  return clonePool(pool);
}

/** Mutate reserved capacity (used by allocation). */
export function adjustPoolReserved(
  id: string,
  delta: number,
): ResourcePool {
  const pool = pools.get(id.trim());
  if (!pool) throw new Error(`resource pool not found: ${id}`);
  if (!Number.isFinite(delta)) {
    throw new Error("reserved delta must be a finite number");
  }

  const next = pool.reserved + delta;
  if (next < 0) {
    throw new Error(`reserved cannot go negative on pool: ${id}`);
  }
  if (next > pool.capacity) {
    throw new Error(
      `insufficient pool capacity: ${pool.capacity - pool.reserved} < ${delta}`,
    );
  }

  pool.reserved = next;
  pools.set(pool.id, pool);
  return clonePool(pool);
}

export function availableInPool(id: string): number {
  const pool = getPool(id);
  if (!pool) throw new Error(`resource pool not found: ${id}`);
  return pool.capacity - pool.reserved;
}

export function removePool(id: string): boolean {
  const pool = pools.get(id.trim());
  if (!pool) return false;
  if (pool.reserved > 0) {
    throw new Error(`cannot remove pool with reserved resources: ${id}`);
  }
  return pools.delete(pool.id);
}

export function buildResourceRegistryManifest(
  quotas: number,
  allocations: number,
): ResourceRegistryManifest {
  const list = listPools();
  return {
    resourceId: E10_RESOURCE_ID,
    version: E10_RESOURCE_VERSION,
    freezeVersion: E10_RESOURCE_FREEZE_VERSION,
    base: E10_RESOURCE_BASE,
    poolCount: list.length,
    quotaCount: quotas,
    allocationCount: allocations,
    pools: list,
  };
}

export function clearPools(): void {
  pools.clear();
}
