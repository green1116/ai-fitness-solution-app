/**
 * Product M09 — AI Prompt version registry (declaration only)
 */

import { AI_PROMPT_VERSION_STATUSES } from "./prompt.constants";
import { getAiPrompt } from "./prompt.registry";
import type {
  AiPromptVersion,
  AiPromptVersionStatus,
  RegisterAiPromptVersionInput,
  UpdateAiPromptVersionStatusInput,
} from "./prompt.types";

const versions = new Map<string, AiPromptVersion>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneVersion(version: AiPromptVersion): AiPromptVersion {
  return { ...version, metadata: { ...version.metadata } };
}

export function registerAiPromptVersion(
  input: RegisterAiPromptVersionInput,
): AiPromptVersion {
  const promptId = input.promptId.trim();
  const versionKey = input.versionKey.trim().toUpperCase();
  const semver = input.semver.trim();
  const bodyRef = input.bodyRef.trim().toUpperCase();
  const variableSchemaRef = input.variableSchemaRef.trim().toUpperCase();
  if (!promptId) throw new Error("version.promptId is required");
  if (!versionKey) throw new Error("version.versionKey is required");
  if (!semver) throw new Error("version.semver is required");
  if (!bodyRef) throw new Error("version.bodyRef is required");
  if (!variableSchemaRef) {
    throw new Error("version.variableSchemaRef is required");
  }

  const prompt = getAiPrompt(promptId);
  if (!prompt) throw new Error(`prompt not found: ${promptId}`);
  if (prompt.status === "RETIRED") {
    throw new Error(`prompt retired: ${promptId}`);
  }

  const duplicate = [...versions.values()].find(
    (v) => v.promptId === promptId && v.versionKey === versionKey,
  );
  if (duplicate) {
    throw new Error(`versionKey already exists: ${versionKey}`);
  }

  const id = input.id?.trim() || createId("aipromptver");
  if (versions.has(id)) throw new Error(`version already exists: ${id}`);

  const now = nowIso();
  const version: AiPromptVersion = {
    id,
    promptId,
    versionKey,
    semver,
    bodyRef,
    variableSchemaRef,
    status: AI_PROMPT_VERSION_STATUSES[0],
    detail: `semver=${semver} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  versions.set(id, version);
  return cloneVersion(version);
}

export function updateAiPromptVersionStatus(
  input: UpdateAiPromptVersionStatusInput,
): AiPromptVersion {
  const versionId = input.versionId.trim();
  if (!versionId) throw new Error("version.versionId is required");
  if (
    !(AI_PROMPT_VERSION_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid version status: ${input.status}`);
  }

  const existing = versions.get(versionId);
  if (!existing) throw new Error(`version not found: ${versionId}`);

  const updated: AiPromptVersion = {
    ...existing,
    status: input.status,
    detail: `semver=${existing.semver} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  versions.set(versionId, updated);
  return cloneVersion(updated);
}

export function getAiPromptVersion(id: string): AiPromptVersion | undefined {
  const version = versions.get(id.trim());
  return version ? cloneVersion(version) : undefined;
}

export function listAiPromptVersions(filter?: {
  promptId?: string;
  status?: AiPromptVersionStatus;
}): AiPromptVersion[] {
  let result = [...versions.values()];
  if (filter?.promptId) {
    const promptId = filter.promptId.trim();
    result = result.filter((v) => v.promptId === promptId);
  }
  if (filter?.status) {
    result = result.filter((v) => v.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.versionKey.localeCompare(b.versionKey))
    .map(cloneVersion);
}

export function clearAiPromptVersions(): void {
  versions.clear();
}
