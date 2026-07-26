/**
 * Product M09 — AI Model Registry (declaration only)
 */

import {
  AI_MODEL_FAMILIES,
  AI_MODEL_STATUSES,
} from "./model.constants";
import type {
  AiModelFamily,
  AiModelStatus,
  ProductAiModel,
  RegisterAiModelInput,
  UpdateAiModelStatusInput,
} from "./model.types";

const models = new Map<string, ProductAiModel>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneModel(model: ProductAiModel): ProductAiModel {
  return { ...model, metadata: { ...model.metadata } };
}

export function registerAiModel(input: RegisterAiModelInput): ProductAiModel {
  const modelKey = input.modelKey.trim().toUpperCase();
  const name = input.name.trim();
  const summary = input.summary.trim();
  if (!modelKey) throw new Error("model.modelKey is required");
  if (!name) throw new Error("model.name is required");
  if (!summary) throw new Error("model.summary is required");
  if (!(AI_MODEL_FAMILIES as readonly string[]).includes(input.family)) {
    throw new Error(`invalid model family: ${input.family}`);
  }
  if (keys.has(modelKey)) {
    throw new Error(`modelKey already exists: ${modelKey}`);
  }

  const id = input.id?.trim() || createId("aimodel");
  if (models.has(id)) throw new Error(`model already exists: ${id}`);

  const now = nowIso();
  const model: ProductAiModel = {
    id,
    modelKey,
    name,
    family: input.family,
    status: AI_MODEL_STATUSES[0],
    summary,
    detail: `family=${input.family} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  models.set(id, model);
  keys.set(modelKey, id);
  return cloneModel(model);
}

export function updateAiModelStatus(
  input: UpdateAiModelStatusInput,
): ProductAiModel {
  const modelId = input.modelId.trim();
  if (!modelId) throw new Error("model.modelId is required");
  if (!(AI_MODEL_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid model status: ${input.status}`);
  }

  const existing = models.get(modelId);
  if (!existing) throw new Error(`model not found: ${modelId}`);

  const updated: ProductAiModel = {
    ...existing,
    status: input.status,
    detail: `family=${existing.family} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  models.set(modelId, updated);
  return cloneModel(updated);
}

export function getAiModel(id: string): ProductAiModel | undefined {
  const model = models.get(id.trim());
  return model ? cloneModel(model) : undefined;
}

export function listAiModels(filter?: {
  family?: AiModelFamily;
  status?: AiModelStatus;
}): ProductAiModel[] {
  let result = [...models.values()];
  if (filter?.family) {
    result = result.filter((m) => m.family === filter.family);
  }
  if (filter?.status) {
    result = result.filter((m) => m.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.modelKey.localeCompare(b.modelKey))
    .map(cloneModel);
}

export function clearAiModels(): void {
  models.clear();
  keys.clear();
}
