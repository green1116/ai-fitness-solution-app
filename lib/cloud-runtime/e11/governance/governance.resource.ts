/**
 * E11-P4 — Governance Resource Model
 */

import { getRuntime } from "../registry/cloud.registry";
import { getTenant } from "../tenant/tenant.namespace";
import { GOVERNANCE_RESOURCE_TYPES } from "./governance.constants";
import type {
  GovernanceResource,
  GovernanceResourceType,
  RegisterGovernanceResourceInput,
} from "./governance.types";

const resources = new Map<string, GovernanceResource>();

function nowIso(): string {
  return new Date().toISOString();
}

function cloneResource(resource: GovernanceResource): GovernanceResource {
  return { ...resource, metadata: { ...resource.metadata } };
}

function assertType(type: string): asserts type is GovernanceResourceType {
  if (!(GOVERNANCE_RESOURCE_TYPES as readonly string[]).includes(type)) {
    throw new Error(`invalid governance resource type: ${type}`);
  }
}

export function registerResource(
  input: RegisterGovernanceResourceInput,
): GovernanceResource {
  const id = input.id.trim();
  const name = input.name.trim();
  if (!id) throw new Error("resource.id is required");
  if (!name) throw new Error("resource.name is required");
  assertType(input.type);
  if (!Number.isFinite(input.capacity) || input.capacity < 0) {
    throw new Error("resource.capacity must be a finite number >= 0");
  }
  if (resources.has(id)) {
    throw new Error(`governance resource already registered: ${id}`);
  }

  const runtimeId = input.runtimeId?.trim();
  if (runtimeId && !getRuntime(runtimeId)) {
    throw new Error(`cloud runtime not found: ${runtimeId}`);
  }
  const tenantId = input.tenantId?.trim();
  if (tenantId && !getTenant(tenantId)) {
    throw new Error(`tenant not found: ${tenantId}`);
  }

  const resource: GovernanceResource = {
    id,
    name,
    type: input.type,
    capacity: input.capacity,
    allocated: 0,
    runtimeId: runtimeId || undefined,
    tenantId: tenantId || undefined,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  resources.set(id, resource);
  return cloneResource(resource);
}

export function getResource(id: string): GovernanceResource | undefined {
  const resource = resources.get(id.trim());
  return resource ? cloneResource(resource) : undefined;
}

export function listResources(filter?: {
  type?: GovernanceResourceType;
  runtimeId?: string;
  tenantId?: string;
}): GovernanceResource[] {
  let result = [...resources.values()];
  if (filter?.type) result = result.filter((r) => r.type === filter.type);
  if (filter?.runtimeId) {
    const rid = filter.runtimeId.trim();
    result = result.filter((r) => r.runtimeId === rid);
  }
  if (filter?.tenantId) {
    const tid = filter.tenantId.trim();
    result = result.filter((r) => r.tenantId === tid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneResource);
}

export function adjustResourceAllocated(
  id: string,
  delta: number,
): GovernanceResource {
  const resource = resources.get(id.trim());
  if (!resource) throw new Error(`governance resource not found: ${id}`);
  const next = resource.allocated + delta;
  if (next < 0) throw new Error(`allocated cannot be negative: ${id}`);
  if (next > resource.capacity) {
    throw new Error(
      `capacity exceeded: ${id} allocated=${next} capacity=${resource.capacity}`,
    );
  }
  resource.allocated = next;
  resources.set(resource.id, resource);
  return cloneResource(resource);
}

export function availableCapacity(id: string): number {
  const resource = resources.get(id.trim());
  if (!resource) throw new Error(`governance resource not found: ${id}`);
  return resource.capacity - resource.allocated;
}

export function clearResources(): void {
  resources.clear();
}
