/**
 * Product P11 — Version registry
 */

import { VERSION_CHANNELS } from "../release/release.constants";
import { getRelease } from "../release/release.registry";
import type {
  PublishVersionInput,
  ReleaseVersion,
  VersionChannel,
} from "./version.types";

const versions = new Map<string, ReleaseVersion>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneVersion(version: ReleaseVersion): ReleaseVersion {
  return { ...version, metadata: { ...version.metadata } };
}

export function publishVersion(input: PublishVersionInput): ReleaseVersion {
  const releaseId = input.releaseId.trim();
  const semver = input.semver.trim();
  if (!releaseId) throw new Error("version.releaseId is required");
  if (!semver) throw new Error("version.semver is required");
  if (!(VERSION_CHANNELS as readonly string[]).includes(input.channel)) {
    throw new Error(`invalid version channel: ${input.channel}`);
  }
  if (!getRelease(releaseId)) {
    throw new Error(`release not found: ${releaseId}`);
  }

  const id = input.id?.trim() || createId("p11ver");
  if (versions.has(id)) {
    throw new Error(`version already exists: ${id}`);
  }

  const notes = (input.notes ?? "").trim();
  const version: ReleaseVersion = {
    id,
    releaseId,
    semver,
    channel: input.channel,
    notes,
    detail: `semver=${semver} channel=${input.channel}`,
    metadata: { ...(input.metadata ?? {}) },
    publishedAt: nowIso(),
  };
  versions.set(id, version);
  return cloneVersion(version);
}

export function getVersion(id: string): ReleaseVersion | undefined {
  const version = versions.get(id.trim());
  return version ? cloneVersion(version) : undefined;
}

export function listVersions(filter?: {
  releaseId?: string;
  channel?: VersionChannel;
}): ReleaseVersion[] {
  let result = [...versions.values()];
  if (filter?.releaseId) {
    const rid = filter.releaseId.trim();
    result = result.filter((v) => v.releaseId === rid);
  }
  if (filter?.channel) {
    result = result.filter((v) => v.channel === filter.channel);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneVersion);
}

export function clearVersions(): void {
  versions.clear();
}
