/**
 * Product M09 — AI Model capability binding (soft capabilityKeyRef only)
 */

import { AI_MODEL_BINDING_STATUSES } from "./model.constants";
import { getAiModel } from "./model.registry";
import type {
  AiModelBindingStatus,
  AiModelCapabilityBinding,
  BindAiModelCapabilityInput,
} from "./model.types";
import { getAiModelVersion } from "./version.registry";

const bindings = new Map<string, AiModelCapabilityBinding>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneBinding(
  binding: AiModelCapabilityBinding,
): AiModelCapabilityBinding {
  return { ...binding, metadata: { ...binding.metadata } };
}

export function bindAiModelCapability(
  input: BindAiModelCapabilityInput,
): AiModelCapabilityBinding {
  const modelId = input.modelId.trim();
  const versionId = input.versionId.trim();
  const bindingKey = input.bindingKey.trim().toUpperCase();
  const capabilityKeyRef = input.capabilityKeyRef.trim().toUpperCase();
  if (!modelId) throw new Error("binding.modelId is required");
  if (!versionId) throw new Error("binding.versionId is required");
  if (!bindingKey) throw new Error("binding.bindingKey is required");
  if (!capabilityKeyRef) {
    throw new Error("binding.capabilityKeyRef is required");
  }

  const model = getAiModel(modelId);
  if (!model) throw new Error(`model not found: ${modelId}`);
  if (model.status !== "ACTIVE") {
    throw new Error(`model not active: ${modelId}`);
  }

  const version = getAiModelVersion(versionId);
  if (!version) throw new Error(`version not found: ${versionId}`);
  if (version.modelId !== modelId) {
    throw new Error(`version model mismatch: ${versionId}`);
  }
  if (version.status !== "PUBLISHED") {
    throw new Error(`version not published: ${versionId}`);
  }

  const duplicate = [...bindings.values()].find(
    (b) => b.modelId === modelId && b.bindingKey === bindingKey,
  );
  if (duplicate) {
    throw new Error(`bindingKey already exists: ${bindingKey}`);
  }

  const id = input.id?.trim() || createId("aimodelbind");
  if (bindings.has(id)) throw new Error(`binding already exists: ${id}`);

  const now = nowIso();
  const binding: AiModelCapabilityBinding = {
    id,
    modelId,
    versionId,
    bindingKey,
    capabilityKeyRef,
    status: AI_MODEL_BINDING_STATUSES[0],
    detail: `capability=${capabilityKeyRef} status=BOUND`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  bindings.set(id, binding);
  return cloneBinding(binding);
}

export function getAiModelCapabilityBinding(
  id: string,
): AiModelCapabilityBinding | undefined {
  const binding = bindings.get(id.trim());
  return binding ? cloneBinding(binding) : undefined;
}

export function listAiModelCapabilityBindings(filter?: {
  modelId?: string;
  status?: AiModelBindingStatus;
}): AiModelCapabilityBinding[] {
  let result = [...bindings.values()];
  if (filter?.modelId) {
    const modelId = filter.modelId.trim();
    result = result.filter((b) => b.modelId === modelId);
  }
  if (filter?.status) {
    result = result.filter((b) => b.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.bindingKey.localeCompare(b.bindingKey))
    .map(cloneBinding);
}

export function clearAiModelCapabilityBindings(): void {
  bindings.clear();
}
