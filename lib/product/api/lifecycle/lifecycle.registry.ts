/**
 * Product API — Lifecycle registry
 */

import { API_LIFECYCLE_STATES } from "../management/management.constants";
import { getApi } from "../registry/api.registry";
import { getApiVersion } from "../version/version.registry";
import type {
  ApiLifecycle,
  ApiLifecycleState,
  OpenApiLifecycleInput,
  TransitionApiLifecycleInput,
} from "./lifecycle.types";

const lifecycles = new Map<string, ApiLifecycle>();

const ALLOWED: Record<ApiLifecycleState, readonly ApiLifecycleState[]> = {
  DRAFT: ["PUBLISHED", "RETIRED"],
  PUBLISHED: ["DEPRECATED", "RETIRED"],
  DEPRECATED: ["RETIRED"],
  RETIRED: [],
};

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneLifecycle(lifecycle: ApiLifecycle): ApiLifecycle {
  return { ...lifecycle, metadata: { ...lifecycle.metadata } };
}

export function openApiLifecycle(
  input: OpenApiLifecycleInput,
): ApiLifecycle {
  const apiId = input.apiId.trim();
  const versionId = input.versionId.trim();
  if (!apiId) throw new Error("lifecycle.apiId is required");
  if (!versionId) throw new Error("lifecycle.versionId is required");
  if (!getApi(apiId)) throw new Error(`api not found: ${apiId}`);
  const version = getApiVersion(versionId);
  if (!version) throw new Error(`version not found: ${versionId}`);
  if (version.apiId !== apiId) {
    throw new Error(`version api mismatch: ${versionId}`);
  }

  const duplicate = [...lifecycles.values()].find(
    (l) => l.apiId === apiId && l.versionId === versionId,
  );
  if (duplicate) {
    throw new Error(`lifecycle already exists: ${versionId}`);
  }

  const id = input.id?.trim() || createId("apilc");
  if (lifecycles.has(id)) throw new Error(`lifecycle already exists: ${id}`);

  const now = nowIso();
  const lifecycle: ApiLifecycle = {
    id,
    apiId,
    versionId,
    state: API_LIFECYCLE_STATES[0],
    detail: "state=DRAFT",
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  lifecycles.set(id, lifecycle);
  return cloneLifecycle(lifecycle);
}

export function transitionApiLifecycle(
  input: TransitionApiLifecycleInput,
): ApiLifecycle {
  const lifecycleId = input.lifecycleId.trim();
  if (!lifecycleId) throw new Error("lifecycle.lifecycleId is required");
  if (!(API_LIFECYCLE_STATES as readonly string[]).includes(input.state)) {
    throw new Error(`invalid lifecycle state: ${input.state}`);
  }

  const existing = lifecycles.get(lifecycleId);
  if (!existing) throw new Error(`lifecycle not found: ${lifecycleId}`);

  const allowed = ALLOWED[existing.state];
  if (!allowed.includes(input.state)) {
    throw new Error(
      `invalid lifecycle transition: ${existing.state} -> ${input.state}`,
    );
  }

  const updated: ApiLifecycle = {
    ...existing,
    state: input.state,
    detail: `state=${input.state}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  lifecycles.set(lifecycleId, updated);
  return cloneLifecycle(updated);
}

export function getApiLifecycle(id: string): ApiLifecycle | undefined {
  const lifecycle = lifecycles.get(id.trim());
  return lifecycle ? cloneLifecycle(lifecycle) : undefined;
}

export function listApiLifecycles(filter?: {
  apiId?: string;
  state?: ApiLifecycleState;
}): ApiLifecycle[] {
  let result = [...lifecycles.values()];
  if (filter?.apiId) {
    const apiId = filter.apiId.trim();
    result = result.filter((l) => l.apiId === apiId);
  }
  if (filter?.state) result = result.filter((l) => l.state === filter.state);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneLifecycle);
}

export function clearApiLifecycles(): void {
  lifecycles.clear();
}
