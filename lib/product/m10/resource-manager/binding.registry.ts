/**
 * Product M10 — AI Resource schedule binding registry (soft-ref only)
 */

import { getAiResourceQuota } from "./quota.registry";
import { AI_RESOURCE_BINDING_STATUSES } from "./resource.constants";
import { getAiResource } from "./resource.registry";
import type {
  AiResourceBindingStatus,
  AiResourceScheduleBinding,
  BindAiResourceScheduleInput,
} from "./resource.types";

const bindings = new Map<string, AiResourceScheduleBinding>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneBinding(
  binding: AiResourceScheduleBinding,
): AiResourceScheduleBinding {
  return { ...binding, metadata: { ...binding.metadata } };
}

export function bindAiResourceSchedule(
  input: BindAiResourceScheduleInput,
): AiResourceScheduleBinding {
  const resourceId = input.resourceId.trim();
  const quotaId = input.quotaId.trim();
  const bindingKey = input.bindingKey.trim().toUpperCase();
  const scheduleKeyRef = input.scheduleKeyRef.trim().toUpperCase();
  if (!resourceId) throw new Error("binding.resourceId is required");
  if (!quotaId) throw new Error("binding.quotaId is required");
  if (!bindingKey) throw new Error("binding.bindingKey is required");
  if (!scheduleKeyRef) throw new Error("binding.scheduleKeyRef is required");

  const resource = getAiResource(resourceId);
  if (!resource) throw new Error(`resource not found: ${resourceId}`);
  if (resource.status !== "ACTIVE") {
    throw new Error(`resource not active: ${resourceId}`);
  }

  const quota = getAiResourceQuota(quotaId);
  if (!quota) throw new Error(`quota not found: ${quotaId}`);
  if (quota.resourceId !== resourceId) {
    throw new Error(`quota resource mismatch: ${quotaId}`);
  }
  if (quota.status !== "DECLARED") {
    throw new Error(`quota not declared: ${quotaId}`);
  }

  const duplicate = [...bindings.values()].find(
    (b) => b.resourceId === resourceId && b.bindingKey === bindingKey,
  );
  if (duplicate) {
    throw new Error(`bindingKey already exists: ${bindingKey}`);
  }

  const id = input.id?.trim() || createId("airesbind");
  if (bindings.has(id)) throw new Error(`binding already exists: ${id}`);

  const now = nowIso();
  const binding: AiResourceScheduleBinding = {
    id,
    resourceId,
    quotaId,
    bindingKey,
    scheduleKeyRef,
    status: AI_RESOURCE_BINDING_STATUSES[0],
    detail: `schedule=${scheduleKeyRef} status=BOUND`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  bindings.set(id, binding);
  return cloneBinding(binding);
}

export function getAiResourceScheduleBinding(
  id: string,
): AiResourceScheduleBinding | undefined {
  const binding = bindings.get(id.trim());
  return binding ? cloneBinding(binding) : undefined;
}

export function listAiResourceScheduleBindings(filter?: {
  resourceId?: string;
  status?: AiResourceBindingStatus;
}): AiResourceScheduleBinding[] {
  let result = [...bindings.values()];
  if (filter?.resourceId) {
    const resourceId = filter.resourceId.trim();
    result = result.filter((b) => b.resourceId === resourceId);
  }
  if (filter?.status) {
    result = result.filter((b) => b.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.bindingKey.localeCompare(b.bindingKey))
    .map(cloneBinding);
}

export function clearAiResourceScheduleBindings(): void {
  bindings.clear();
}
