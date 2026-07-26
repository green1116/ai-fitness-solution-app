/**
 * Product M10 — AI Resource definition registry (definition only)
 */

import { AI_RESOURCE_KINDS, AI_RESOURCE_STATUSES } from "./resource.constants";
import type {
  AiResourceDefinition,
  AiResourceKind,
  AiResourceStatus,
  RegisterAiResourceInput,
  UpdateAiResourceStatusInput,
} from "./resource.types";

const resources = new Map<string, AiResourceDefinition>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneResource(
  resource: AiResourceDefinition,
): AiResourceDefinition {
  return { ...resource, metadata: { ...resource.metadata } };
}

export function registerAiResource(
  input: RegisterAiResourceInput,
): AiResourceDefinition {
  const resourceKey = input.resourceKey.trim().toUpperCase();
  const title = input.title.trim();
  const unit = input.unit.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!resourceKey) throw new Error("resource.resourceKey is required");
  if (!title) throw new Error("resource.title is required");
  if (!unit) throw new Error("resource.unit is required");
  if (!summary) throw new Error("resource.summary is required");
  if (!(AI_RESOURCE_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid resource kind: ${input.kind}`);
  }
  if (keys.has(resourceKey)) {
    throw new Error(`resourceKey already exists: ${resourceKey}`);
  }

  const id = input.id?.trim() || createId("aires");
  if (resources.has(id)) throw new Error(`resource already exists: ${id}`);

  const now = nowIso();
  const resource: AiResourceDefinition = {
    id,
    resourceKey,
    kind: input.kind,
    status: AI_RESOURCE_STATUSES[0],
    title,
    unit,
    summary,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  resources.set(id, resource);
  keys.set(resourceKey, id);
  return cloneResource(resource);
}

export function updateAiResourceStatus(
  input: UpdateAiResourceStatusInput,
): AiResourceDefinition {
  const resourceId = input.resourceId.trim();
  if (!resourceId) throw new Error("resource.resourceId is required");
  if (!(AI_RESOURCE_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid resource status: ${input.status}`);
  }

  const existing = resources.get(resourceId);
  if (!existing) throw new Error(`resource not found: ${resourceId}`);

  const updated: AiResourceDefinition = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  resources.set(resourceId, updated);
  return cloneResource(updated);
}

export function getAiResource(id: string): AiResourceDefinition | undefined {
  const resource = resources.get(id.trim());
  return resource ? cloneResource(resource) : undefined;
}

export function listAiResources(filter?: {
  kind?: AiResourceKind;
  status?: AiResourceStatus;
}): AiResourceDefinition[] {
  let result = [...resources.values()];
  if (filter?.kind) result = result.filter((r) => r.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((r) => r.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.resourceKey.localeCompare(b.resourceKey))
    .map(cloneResource);
}

export function clearAiResources(): void {
  resources.clear();
  keys.clear();
}
