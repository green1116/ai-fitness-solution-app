/**
 * Product M09 — AI Orchestration version registry (declaration only)
 */

import { AI_ORCHESTRATION_VERSION_STATUSES } from "./orchestration.constants";
import { getAiOrchestration } from "./orchestration.registry";
import type {
  AiOrchestrationVersion,
  AiOrchestrationVersionStatus,
  RegisterAiOrchestrationVersionInput,
  UpdateAiOrchestrationVersionStatusInput,
} from "./orchestration.types";

const versions = new Map<string, AiOrchestrationVersion>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneVersion(
  version: AiOrchestrationVersion,
): AiOrchestrationVersion {
  return { ...version, metadata: { ...version.metadata } };
}

export function registerAiOrchestrationVersion(
  input: RegisterAiOrchestrationVersionInput,
): AiOrchestrationVersion {
  const orchestrationId = input.orchestrationId.trim();
  const versionKey = input.versionKey.trim().toUpperCase();
  const semver = input.semver.trim();
  if (!orchestrationId) {
    throw new Error("version.orchestrationId is required");
  }
  if (!versionKey) throw new Error("version.versionKey is required");
  if (!semver) throw new Error("version.semver is required");

  const plan = getAiOrchestration(orchestrationId);
  if (!plan) throw new Error(`orchestration not found: ${orchestrationId}`);
  if (plan.status === "RETIRED") {
    throw new Error(`orchestration retired: ${orchestrationId}`);
  }

  const duplicate = [...versions.values()].find(
    (v) =>
      v.orchestrationId === orchestrationId && v.versionKey === versionKey,
  );
  if (duplicate) {
    throw new Error(`versionKey already exists: ${versionKey}`);
  }

  const id = input.id?.trim() || createId("aiorchver");
  if (versions.has(id)) throw new Error(`version already exists: ${id}`);

  const now = nowIso();
  const version: AiOrchestrationVersion = {
    id,
    orchestrationId,
    versionKey,
    semver,
    status: AI_ORCHESTRATION_VERSION_STATUSES[0],
    detail: `semver=${semver} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  versions.set(id, version);
  return cloneVersion(version);
}

export function updateAiOrchestrationVersionStatus(
  input: UpdateAiOrchestrationVersionStatusInput,
): AiOrchestrationVersion {
  const versionId = input.versionId.trim();
  if (!versionId) throw new Error("version.versionId is required");
  if (
    !(AI_ORCHESTRATION_VERSION_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid version status: ${input.status}`);
  }

  const existing = versions.get(versionId);
  if (!existing) throw new Error(`version not found: ${versionId}`);

  const updated: AiOrchestrationVersion = {
    ...existing,
    status: input.status,
    detail: `semver=${existing.semver} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  versions.set(versionId, updated);
  return cloneVersion(updated);
}

export function getAiOrchestrationVersion(
  id: string,
): AiOrchestrationVersion | undefined {
  const version = versions.get(id.trim());
  return version ? cloneVersion(version) : undefined;
}

export function listAiOrchestrationVersions(filter?: {
  orchestrationId?: string;
  status?: AiOrchestrationVersionStatus;
}): AiOrchestrationVersion[] {
  let result = [...versions.values()];
  if (filter?.orchestrationId) {
    const orchestrationId = filter.orchestrationId.trim();
    result = result.filter((v) => v.orchestrationId === orchestrationId);
  }
  if (filter?.status) {
    result = result.filter((v) => v.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.versionKey.localeCompare(b.versionKey))
    .map(cloneVersion);
}

export function clearAiOrchestrationVersions(): void {
  versions.clear();
}
