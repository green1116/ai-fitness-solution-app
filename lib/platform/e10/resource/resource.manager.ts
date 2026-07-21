/**
 * E10-P3 — Resource Manager
 * Pool / quota / allocation orchestration (no external infra)
 */

import {
  E10_RESOURCE_ID,
  E10_RESOURCE_VERSION,
  RESOURCE_MANAGER_STATUSES,
} from "./resource.constants";
import {
  allocateResource,
  clearAllocations,
  getAllocation,
  listAllocations,
  releaseResource,
} from "./resource.allocation";
import {
  availableInPool,
  buildResourceRegistryManifest,
  clearPools,
  createPool,
  getPool,
  listPools,
  removePool,
  setPoolStatus,
} from "./resource.pool";
import {
  clearQuotas,
  createQuota,
  getQuota,
  listQuotas,
  removeQuota,
} from "./resource.quota";
import type {
  AllocateResourceInput,
  CreateResourcePoolInput,
  CreateResourceQuotaInput,
  ResourceAllocation,
  ResourceManagerStatus,
  ResourcePool,
  ResourceQuota,
  ResourceUsageSnapshot,
} from "./resource.types";

export type ResourceManagerSnapshot = {
  managerId: string;
  status: ResourceManagerStatus;
  layerId: typeof E10_RESOURCE_ID;
  version: typeof E10_RESOURCE_VERSION;
  poolCount: number;
  quotaCount: number;
  activeAllocationCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type ResourceManager = {
  initialize: () => ResourceManagerSnapshot;
  start: () => ResourceManagerSnapshot;
  stop: () => ResourceManagerSnapshot;
  status: () => ResourceManagerSnapshot;
  createPool: (input: CreateResourcePoolInput) => ResourcePool;
  getPool: (id: string) => ResourcePool | undefined;
  listPools: typeof listPools;
  setPoolStatus: typeof setPoolStatus;
  removePool: (id: string) => boolean;
  createQuota: (input: CreateResourceQuotaInput) => ResourceQuota;
  getQuota: (id: string) => ResourceQuota | undefined;
  listQuotas: typeof listQuotas;
  removeQuota: (id: string) => boolean;
  allocate: (input: AllocateResourceInput) => ResourceAllocation;
  release: (allocationId: string) => ResourceAllocation;
  getAllocation: (id: string) => ResourceAllocation | undefined;
  listAllocations: typeof listAllocations;
  usage: () => ResourceUsageSnapshot;
  availableInPool: (poolId: string) => number;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createResourceManager(options?: {
  managerId?: string;
}): ResourceManager {
  const managerId =
    options?.managerId?.trim() || createId("e10-res-mgr");
  let state: ResourceManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): ResourceManagerSnapshot {
    return {
      managerId,
      status: state,
      layerId: E10_RESOURCE_ID,
      version: E10_RESOURCE_VERSION,
      poolCount: listPools().length,
      quotaCount: listQuotas().length,
      activeAllocationCount: listAllocations({ status: "ACTIVE" }).length,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): ResourceManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearAllocations();
    clearQuotas();
    clearPools();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): ResourceManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(
        `start requires READY or STOPPED (current=${state})`,
      );
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): ResourceManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }

    // Release active allocations on shutdown
    for (const allocation of listAllocations({ status: "ACTIVE" })) {
      releaseResource(allocation.id);
    }

    state = "STOPPED";
    stoppedAt = nowIso();
    return snapshot();
  }

  function usage(): ResourceUsageSnapshot {
    const pools = listPools();
    const totalCapacity = pools.reduce((sum, p) => sum + p.capacity, 0);
    const totalReserved = pools.reduce((sum, p) => sum + p.reserved, 0);
    return {
      managerId,
      managerStatus: state,
      poolCount: pools.length,
      openPoolCount: pools.filter((p) => p.status === "OPEN").length,
      quotaCount: listQuotas().length,
      activeAllocationCount: listAllocations({ status: "ACTIVE" }).length,
      totalCapacity,
      totalReserved,
      totalAvailable: totalCapacity - totalReserved,
      capturedAt: nowIso(),
    };
  }

  return {
    initialize,
    start,
    stop,
    status: snapshot,
    createPool: (input) => {
      assertRunning("createPool");
      return createPool(input);
    },
    getPool,
    listPools,
    setPoolStatus: (id, status) => {
      assertRunning("setPoolStatus");
      return setPoolStatus(id, status);
    },
    removePool: (id) => {
      assertRunning("removePool");
      return removePool(id);
    },
    createQuota: (input) => {
      assertRunning("createQuota");
      return createQuota(input);
    },
    getQuota,
    listQuotas,
    removeQuota: (id) => {
      assertRunning("removeQuota");
      return removeQuota(id);
    },
    allocate: (input) => {
      assertRunning("allocate");
      return allocateResource(input);
    },
    release: (allocationId) => {
      assertRunning("release");
      return releaseResource(allocationId);
    },
    getAllocation,
    listAllocations,
    usage,
    availableInPool,
  };
}

export function getResourceRegistryManifest() {
  return buildResourceRegistryManifest(
    listQuotas().length,
    listAllocations().length,
  );
}

export { RESOURCE_MANAGER_STATUSES };
