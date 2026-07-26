/**
 * Product M09 — AI Model version registry (declaration only)
 */

import { AI_MODEL_VERSION_STATUSES } from "./model.constants";
import { getAiModel } from "./model.registry";
import type {
  AiModelVersion,
  AiModelVersionStatus,
  RegisterAiModelVersionInput,
  UpdateAiModelVersionStatusInput,
} from "./model.types";

const versions = new Map<string, AiModelVersion>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneVersion(version: AiModelVersion): AiModelVersion {
  return { ...version, metadata: { ...version.metadata } };
}

export function registerAiModelVersion(
  input: RegisterAiModelVersionInput,
): AiModelVersion {
  const modelId = input.modelId.trim();
  const versionKey = input.versionKey.trim().toUpperCase();
  const semver = input.semver.trim();
  if (!modelId) throw new Error("version.modelId is required");
  if (!versionKey) throw new Error("version.versionKey is required");
  if (!semver) throw new Error("version.semver is required");

  const model = getAiModel(modelId);
  if (!model) throw new Error(`model not found: ${modelId}`);
  if (model.status === "RETIRED") {
    throw new Error(`model retired: ${modelId}`);
  }

  const duplicate = [...versions.values()].find(
    (v) => v.modelId === modelId && v.versionKey === versionKey,
  );
  if (duplicate) {
    throw new Error(`versionKey already exists: ${versionKey}`);
  }

  const id = input.id?.trim() || createId("aimodelver");
  if (versions.has(id)) throw new Error(`version already exists: ${id}`);

  const now = nowIso();
  const version: AiModelVersion = {
    id,
    modelId,
    versionKey,
    semver,
    status: AI_MODEL_VERSION_STATUSES[0],
    detail: `semver=${semver} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  versions.set(id, version);
  return cloneVersion(version);
}

export function updateAiModelVersionStatus(
  input: UpdateAiModelVersionStatusInput,
): AiModelVersion {
  const versionId = input.versionId.trim();
  if (!versionId) throw new Error("version.versionId is required");
  if (
    !(AI_MODEL_VERSION_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid version status: ${input.status}`);
  }

  const existing = versions.get(versionId);
  if (!existing) throw new Error(`version not found: ${versionId}`);

  const updated: AiModelVersion = {
    ...existing,
    status: input.status,
    detail: `semver=${existing.semver} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  versions.set(versionId, updated);
  return cloneVersion(updated);
}

export function getAiModelVersion(id: string): AiModelVersion | undefined {
  const version = versions.get(id.trim());
  return version ? cloneVersion(version) : undefined;
}

export function listAiModelVersions(filter?: {
  modelId?: string;
  status?: AiModelVersionStatus;
}): AiModelVersion[] {
  let result = [...versions.values()];
  if (filter?.modelId) {
    const modelId = filter.modelId.trim();
    result = result.filter((v) => v.modelId === modelId);
  }
  if (filter?.status) {
    result = result.filter((v) => v.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.versionKey.localeCompare(b.versionKey))
    .map(cloneVersion);
}

export function clearAiModelVersions(): void {
  versions.clear();
}
