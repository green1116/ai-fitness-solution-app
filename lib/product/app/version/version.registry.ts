/**
 * Product App — version registry
 */

import { APP_VERSION_STATUSES } from "../management/management.constants";
import { getAppDefinition } from "../definition/definition.registry";
import { getApp } from "../registry/app.registry";
import type {
  AppVersion,
  AppVersionStatus,
  RegisterAppVersionInput,
  UpdateAppVersionStatusInput,
} from "./version.types";

const versions = new Map<string, AppVersion>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneVersion(version: AppVersion): AppVersion {
  return { ...version, metadata: { ...version.metadata } };
}

export function registerAppVersion(
  input: RegisterAppVersionInput,
): AppVersion {
  const appId = input.appId.trim();
  const definitionId = input.definitionId.trim();
  const versionKey = input.versionKey.trim().toUpperCase();
  const semver = input.semver.trim();
  if (!appId) throw new Error("version.appId is required");
  if (!definitionId) throw new Error("version.definitionId is required");
  if (!versionKey) throw new Error("version.versionKey is required");
  if (!semver) throw new Error("version.semver is required");

  const app = getApp(appId);
  if (!app) throw new Error(`app not found: ${appId}`);
  if (app.status === "RETIRED") {
    throw new Error(`app retired: ${appId}`);
  }

  const definition = getAppDefinition(definitionId);
  if (!definition) throw new Error(`definition not found: ${definitionId}`);
  if (definition.appId !== appId) {
    throw new Error(`definition app mismatch: ${definitionId}`);
  }

  const duplicate = [...versions.values()].find(
    (v) => v.appId === appId && v.versionKey === versionKey,
  );
  if (duplicate) {
    throw new Error(`versionKey already exists: ${versionKey}`);
  }

  const id = input.id?.trim() || createId("appver");
  if (versions.has(id)) throw new Error(`version already exists: ${id}`);

  const now = nowIso();
  const version: AppVersion = {
    id,
    appId,
    definitionId,
    versionKey,
    semver,
    status: APP_VERSION_STATUSES[0],
    detail: `semver=${semver} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  versions.set(id, version);
  return cloneVersion(version);
}

export function updateAppVersionStatus(
  input: UpdateAppVersionStatusInput,
): AppVersion {
  const versionId = input.versionId.trim();
  if (!versionId) throw new Error("version.versionId is required");
  if (!(APP_VERSION_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid version status: ${input.status}`);
  }

  const existing = versions.get(versionId);
  if (!existing) throw new Error(`version not found: ${versionId}`);

  const updated: AppVersion = {
    ...existing,
    status: input.status,
    detail: `semver=${existing.semver} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  versions.set(versionId, updated);
  return cloneVersion(updated);
}

export function getAppVersion(id: string): AppVersion | undefined {
  const version = versions.get(id.trim());
  return version ? cloneVersion(version) : undefined;
}

export function listAppVersions(filter?: {
  appId?: string;
  status?: AppVersionStatus;
}): AppVersion[] {
  let result = [...versions.values()];
  if (filter?.appId) {
    const appId = filter.appId.trim();
    result = result.filter((v) => v.appId === appId);
  }
  if (filter?.status) {
    result = result.filter((v) => v.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.versionKey.localeCompare(b.versionKey))
    .map(cloneVersion);
}

export function clearAppVersions(): void {
  versions.clear();
}
