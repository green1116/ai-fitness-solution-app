/**
 * E11-P4 — Allocation Manager
 */

import { getTenant } from "../tenant/tenant.namespace";
import {
  getTenantQuotaByType,
  reserveQuota,
  releaseQuota,
} from "../tenant/tenant.quota";
import { getRuntime } from "../registry/cloud.registry";
import { WORKLOAD_PRIORITIES } from "./governance.constants";
import {
  adjustResourceAllocated,
  availableCapacity,
  getResource,
} from "./governance.resource";
import type {
  AllocateResourceInput,
  ResourceAllocation,
  WorkloadPriority,
} from "./governance.types";

const allocations = new Map<string, ResourceAllocation>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAllocation(a: ResourceAllocation): ResourceAllocation {
  return { ...a };
}

function assertPriority(
  priority: string,
): asserts priority is WorkloadPriority {
  if (!(WORKLOAD_PRIORITIES as readonly string[]).includes(priority)) {
    throw new Error(`invalid workload priority: ${priority}`);
  }
}

/**
 * Map governance resource type loosely to tenant TASK quota for governance gate.
 * CPU/MEMORY/SLOT/BANDWIDTH allocations also consume tenant TASK quota units when present.
 */
export function allocateResource(
  input: AllocateResourceInput,
): ResourceAllocation {
  const resourceId = input.resourceId.trim();
  const tenantId = input.tenantId.trim();
  if (!resourceId) throw new Error("allocation.resourceId is required");
  if (!tenantId) throw new Error("allocation.tenantId is required");
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("allocation.amount must be a finite number > 0");
  }

  const priority = input.priority ?? "NORMAL";
  assertPriority(priority);

  if (!getTenant(tenantId)) {
    throw new Error(`tenant not found: ${tenantId}`);
  }

  const runtimeId = input.runtimeId?.trim();
  if (runtimeId && !getRuntime(runtimeId)) {
    throw new Error(`cloud runtime not found: ${runtimeId}`);
  }

  const resource = getResource(resourceId);
  if (!resource) throw new Error(`governance resource not found: ${resourceId}`);

  const id = input.id?.trim() || createId("galloc");
  if (allocations.has(id)) {
    throw new Error(`allocation already exists: ${id}`);
  }

  if (availableCapacity(resourceId) < input.amount) {
    const denied: ResourceAllocation = {
      id,
      resourceId,
      tenantId,
      runtimeId: runtimeId || undefined,
      amount: input.amount,
      priority,
      status: "DENIED",
      createdAt: nowIso(),
      reason: "insufficient capacity",
    };
    allocations.set(id, denied);
    return cloneAllocation(denied);
  }

  // Integrate tenant quota when TASK quota exists
  const taskQuota = getTenantQuotaByType(tenantId, "TASK");
  if (taskQuota) {
    try {
      reserveQuota(tenantId, "TASK", 1);
    } catch {
      const denied: ResourceAllocation = {
        id,
        resourceId,
        tenantId,
        runtimeId: runtimeId || undefined,
        amount: input.amount,
        priority,
        status: "DENIED",
        createdAt: nowIso(),
        reason: "tenant TASK quota exceeded",
      };
      allocations.set(id, denied);
      return cloneAllocation(denied);
    }
  }

  adjustResourceAllocated(resourceId, input.amount);
  const allocation: ResourceAllocation = {
    id,
    resourceId,
    tenantId,
    runtimeId: runtimeId || undefined,
    amount: input.amount,
    priority,
    status: "ACTIVE",
    createdAt: nowIso(),
  };
  allocations.set(id, allocation);
  return cloneAllocation(allocation);
}

export function releaseAllocation(id: string): ResourceAllocation {
  const allocation = allocations.get(id.trim());
  if (!allocation) throw new Error(`allocation not found: ${id}`);
  if (allocation.status !== "ACTIVE") {
    throw new Error(
      `release requires ACTIVE (current=${allocation.status})`,
    );
  }

  adjustResourceAllocated(allocation.resourceId, -allocation.amount);
  const taskQuota = getTenantQuotaByType(allocation.tenantId, "TASK");
  if (taskQuota && taskQuota.used > 0) {
    try {
      releaseQuota(allocation.tenantId, "TASK", 1);
    } catch {
      // ignore quota release failures
    }
  }

  allocation.status = "RELEASED";
  allocation.releasedAt = nowIso();
  allocations.set(allocation.id, allocation);
  return cloneAllocation(allocation);
}

export function getAllocation(id: string): ResourceAllocation | undefined {
  const a = allocations.get(id.trim());
  return a ? cloneAllocation(a) : undefined;
}

export function listAllocations(filter?: {
  resourceId?: string;
  tenantId?: string;
  status?: ResourceAllocation["status"];
  priority?: WorkloadPriority;
}): ResourceAllocation[] {
  let result = [...allocations.values()];
  if (filter?.resourceId) {
    const rid = filter.resourceId.trim();
    result = result.filter((a) => a.resourceId === rid);
  }
  if (filter?.tenantId) {
    const tid = filter.tenantId.trim();
    result = result.filter((a) => a.tenantId === tid);
  }
  if (filter?.status) {
    result = result.filter((a) => a.status === filter.status);
  }
  if (filter?.priority) {
    result = result.filter((a) => a.priority === filter.priority);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAllocation);
}

export function clearAllocations(): void {
  allocations.clear();
}
