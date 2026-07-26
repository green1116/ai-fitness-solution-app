/**
 * Product API — Version registry
 */

import { getApiDefinition } from "../definition/definition.registry";
import { getApi } from "../registry/api.registry";
import type {
  ApiVersion,
  RegisterApiVersionInput,
} from "./version.types";

const versions = new Map<string, ApiVersion>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneVersion(version: ApiVersion): ApiVersion {
  return {
    ...version,
    definitionIds: [...version.definitionIds],
    metadata: { ...version.metadata },
  };
}

export function registerApiVersion(
  input: RegisterApiVersionInput,
): ApiVersion {
  const apiId = input.apiId.trim();
  const versionTag = input.versionTag.trim();
  if (!apiId) throw new Error("version.apiId is required");
  if (!versionTag) throw new Error("version.versionTag is required");
  if (!input.definitionIds.length) {
    throw new Error("version.definitionIds is required");
  }
  if (!getApi(apiId)) throw new Error(`api not found: ${apiId}`);

  const definitionIds = input.definitionIds
    .map((id) => id.trim())
    .filter(Boolean);
  for (const definitionId of definitionIds) {
    const definition = getApiDefinition(definitionId);
    if (!definition) throw new Error(`definition not found: ${definitionId}`);
    if (definition.apiId !== apiId) {
      throw new Error(`definition api mismatch: ${definitionId}`);
    }
  }

  const duplicate = [...versions.values()].find(
    (v) => v.apiId === apiId && v.versionTag === versionTag,
  );
  if (duplicate) {
    throw new Error(`version already exists: ${versionTag}`);
  }

  const id = input.id?.trim() || createId("apiver");
  if (versions.has(id)) throw new Error(`version already exists: ${id}`);

  const version: ApiVersion = {
    id,
    apiId,
    versionTag,
    definitionIds: [...definitionIds].sort((a, b) => a.localeCompare(b)),
    detail: `version=${versionTag} defs=${definitionIds.length}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  versions.set(id, version);
  return cloneVersion(version);
}

export function getApiVersion(id: string): ApiVersion | undefined {
  const version = versions.get(id.trim());
  return version ? cloneVersion(version) : undefined;
}

export function listApiVersions(filter?: { apiId?: string }): ApiVersion[] {
  let result = [...versions.values()];
  if (filter?.apiId) {
    const apiId = filter.apiId.trim();
    result = result.filter((v) => v.apiId === apiId);
  }
  return result
    .slice()
    .sort((a, b) => a.versionTag.localeCompare(b.versionTag))
    .map(cloneVersion);
}

export function clearApiVersions(): void {
  versions.clear();
}
