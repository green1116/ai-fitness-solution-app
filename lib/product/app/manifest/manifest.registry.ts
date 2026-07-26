/**
 * Product App — Release manifest + checksum
 */

import { createHash } from "node:crypto";

import { listAppDefinitions } from "../definition/definition.registry";
import { listAppOwnerships } from "../ownership/ownership.registry";
import { getApp } from "../registry/app.registry";
import { listAppVersions } from "../version/version.registry";

export type AppReleaseManifest = {
  id: string;
  appId: string;
  appKey: string;
  checksum: string;
  definitionId: string;
  versionId: string;
  ownershipId: string;
  createdAt: string;
};

const releases = new Map<string, AppReleaseManifest>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRelease(release: AppReleaseManifest): AppReleaseManifest {
  return { ...release };
}

export function createAppReleaseManifest(input: {
  id?: string;
  appId: string;
}): AppReleaseManifest {
  const appId = input.appId.trim();
  if (!appId) throw new Error("manifest.appId is required");

  const app = getApp(appId);
  if (!app) throw new Error(`app not found: ${appId}`);

  const definitions = listAppDefinitions({ appId });
  if (definitions.length < 1) throw new Error("app definition missing");
  const versions = listAppVersions({ appId });
  const published = versions.find((v) => v.status === "PUBLISHED");
  if (!published) throw new Error("published app version missing");
  const ownerships = listAppOwnerships({ appId });
  const assigned = ownerships.find((o) => o.status === "ASSIGNED");
  if (!assigned) throw new Error("assigned app ownership missing");

  const payload = {
    appKey: app.appKey,
    kind: app.kind,
    status: app.status,
    definition: {
      definitionKey: definitions[0].definitionKey,
      capabilityRef: definitions[0].capabilityRef,
      summary: definitions[0].summary,
    },
    version: {
      versionKey: published.versionKey,
      semver: published.semver,
      status: published.status,
    },
    ownership: {
      ownershipKey: assigned.ownershipKey,
      partnerKeyRef: assigned.partnerKeyRef,
      status: assigned.status,
    },
  };

  const id = input.id?.trim() || createId("apprel");
  if (releases.has(id)) throw new Error(`release already exists: ${id}`);

  const release: AppReleaseManifest = {
    id,
    appId,
    appKey: app.appKey,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    definitionId: definitions[0].id,
    versionId: published.id,
    ownershipId: assigned.id,
    createdAt: nowIso(),
  };
  releases.set(id, release);
  return cloneRelease(release);
}

export function getAppReleaseManifest(
  id: string,
): AppReleaseManifest | undefined {
  const release = releases.get(id.trim());
  return release ? cloneRelease(release) : undefined;
}

export function listAppReleaseManifests(): AppReleaseManifest[] {
  return [...releases.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRelease);
}

export function clearAppReleaseManifests(): void {
  releases.clear();
}
