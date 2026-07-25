/**
 * Product Configuration — Release registry
 */

import { CONFIG_RELEASE_STATUSES } from "../management/management.constants";
import { getConfigNamespace } from "../namespace/namespace.registry";
import { getConfigParameter } from "../parameter/parameter.registry";
import type {
  ConfigRelease,
  ConfigReleaseStatus,
  CreateConfigReleaseInput,
  UpdateConfigReleaseStatusInput,
} from "./release.types";

const releases = new Map<string, ConfigRelease>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRelease(release: ConfigRelease): ConfigRelease {
  return {
    ...release,
    parameterIds: [...release.parameterIds],
    metadata: { ...release.metadata },
  };
}

export function createConfigRelease(
  input: CreateConfigReleaseInput,
): ConfigRelease {
  const namespaceId = input.namespaceId.trim();
  const versionTag = input.versionTag.trim();
  if (!namespaceId) throw new Error("release.namespaceId is required");
  if (!versionTag) throw new Error("release.versionTag is required");
  if (!input.parameterIds.length) {
    throw new Error("release.parameterIds is required");
  }

  const namespace = getConfigNamespace(namespaceId);
  if (!namespace) throw new Error(`namespace not found: ${namespaceId}`);
  if (namespace.status !== "ACTIVE") {
    throw new Error(`namespace not active: ${namespaceId}`);
  }

  const parameterIds = input.parameterIds.map((id) => id.trim()).filter(Boolean);
  for (const parameterId of parameterIds) {
    const parameter = getConfigParameter(parameterId);
    if (!parameter) throw new Error(`parameter not found: ${parameterId}`);
    if (parameter.namespaceId !== namespaceId) {
      throw new Error(`parameter namespace mismatch: ${parameterId}`);
    }
  }

  const duplicate = [...releases.values()].find(
    (r) => r.namespaceId === namespaceId && r.versionTag === versionTag,
  );
  if (duplicate) {
    throw new Error(`release version already exists: ${versionTag}`);
  }

  const id = input.id?.trim() || createId("cfgrls");
  if (releases.has(id)) throw new Error(`release already exists: ${id}`);

  const now = nowIso();
  const release: ConfigRelease = {
    id,
    namespaceId,
    versionTag,
    status: CONFIG_RELEASE_STATUSES[0],
    parameterIds,
    detail: `version=${versionTag} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  releases.set(id, release);
  return cloneRelease(release);
}

export function updateConfigReleaseStatus(
  input: UpdateConfigReleaseStatusInput,
): ConfigRelease {
  const releaseId = input.releaseId.trim();
  if (!releaseId) throw new Error("release.releaseId is required");
  if (!(CONFIG_RELEASE_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid release status: ${input.status}`);
  }

  const existing = releases.get(releaseId);
  if (!existing) throw new Error(`release not found: ${releaseId}`);

  const updated: ConfigRelease = {
    ...existing,
    status: input.status,
    parameterIds: [...existing.parameterIds],
    detail: `version=${existing.versionTag} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  releases.set(releaseId, updated);
  return cloneRelease(updated);
}

export function getConfigRelease(id: string): ConfigRelease | undefined {
  const release = releases.get(id.trim());
  return release ? cloneRelease(release) : undefined;
}

export function listConfigReleases(filter?: {
  namespaceId?: string;
  status?: ConfigReleaseStatus;
}): ConfigRelease[] {
  let result = [...releases.values()];
  if (filter?.namespaceId) {
    const namespaceId = filter.namespaceId.trim();
    result = result.filter((r) => r.namespaceId === namespaceId);
  }
  if (filter?.status) {
    result = result.filter((r) => r.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRelease);
}

export function clearConfigReleases(): void {
  releases.clear();
}
