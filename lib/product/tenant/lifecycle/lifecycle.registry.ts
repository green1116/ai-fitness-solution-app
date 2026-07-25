/**
 * Product Tenant — Lifecycle registry
 */

import { TENANT_LIFECYCLE_STATES } from "../administration/administration.constants";
import { getTenantRecord } from "../record/record.registry";
import type {
  CreateTenantLifecycleInput,
  TenantLifecycle,
  TenantLifecycleState,
  TransitionTenantLifecycleInput,
} from "./lifecycle.types";

const lifecycles = new Map<string, TenantLifecycle>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneLifecycle(lifecycle: TenantLifecycle): TenantLifecycle {
  return { ...lifecycle, metadata: { ...lifecycle.metadata } };
}

export function createTenantLifecycle(
  input: CreateTenantLifecycleInput,
): TenantLifecycle {
  const recordId = input.recordId.trim();
  if (!recordId) throw new Error("lifecycle.recordId is required");
  const record = getTenantRecord(recordId);
  if (!record) throw new Error(`tenant record not found: ${recordId}`);
  if (record.status !== "ACTIVE") {
    throw new Error(`tenant record not active: ${recordId}`);
  }

  const existing = [...lifecycles.values()].find(
    (l) => l.recordId === recordId,
  );
  if (existing) {
    throw new Error(`tenant lifecycle already exists: ${recordId}`);
  }

  const id = input.id?.trim() || createId("tntlc");
  if (lifecycles.has(id)) {
    throw new Error(`tenant lifecycle already exists: ${id}`);
  }

  const now = nowIso();
  const lifecycle: TenantLifecycle = {
    id,
    recordId,
    state: TENANT_LIFECYCLE_STATES[0],
    detail: `state=PROVISIONED`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  lifecycles.set(id, lifecycle);
  return cloneLifecycle(lifecycle);
}

export function transitionTenantLifecycle(
  input: TransitionTenantLifecycleInput,
): TenantLifecycle {
  const lifecycleId = input.lifecycleId.trim();
  if (!lifecycleId) throw new Error("lifecycle.lifecycleId is required");
  if (!(TENANT_LIFECYCLE_STATES as readonly string[]).includes(input.state)) {
    throw new Error(`invalid lifecycle state: ${input.state}`);
  }

  const existing = lifecycles.get(lifecycleId);
  if (!existing) throw new Error(`tenant lifecycle not found: ${lifecycleId}`);

  const updated: TenantLifecycle = {
    ...existing,
    state: input.state,
    detail: `state=${input.state}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  lifecycles.set(lifecycleId, updated);
  return cloneLifecycle(updated);
}

export function getTenantLifecycle(id: string): TenantLifecycle | undefined {
  const lifecycle = lifecycles.get(id.trim());
  return lifecycle ? cloneLifecycle(lifecycle) : undefined;
}

export function listTenantLifecycles(filter?: {
  recordId?: string;
  state?: TenantLifecycleState;
}): TenantLifecycle[] {
  let result = [...lifecycles.values()];
  if (filter?.recordId) {
    const recordId = filter.recordId.trim();
    result = result.filter((l) => l.recordId === recordId);
  }
  if (filter?.state) result = result.filter((l) => l.state === filter.state);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneLifecycle);
}

export function clearTenantLifecycles(): void {
  lifecycles.clear();
}
