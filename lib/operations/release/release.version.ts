/**
 * Post-Launch P4 — Version Tracking
 */

import { getDeploymentPackage } from "../../product/e12/deployment/deployment.package";
import { RELEASE_VERSION_KINDS } from "./release.constants";
import {
  bindReleaseVersion,
  getOperationsRelease,
} from "./release.lifecycle";
import type {
  ReleaseVersionKind,
  ReleaseVersionRecord,
  TrackReleaseVersionInput,
} from "./release.types";

const versions = new Map<string, ReleaseVersionRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneVersion(record: ReleaseVersionRecord): ReleaseVersionRecord {
  return { ...record };
}

function assertSemverLike(version: string): void {
  if (!/^\d+\.\d+\.\d+([-.][A-Za-z0-9]+)?$/.test(version)) {
    throw new Error(`invalid version format: ${version}`);
  }
}

export function trackReleaseVersion(
  input: TrackReleaseVersionInput,
): ReleaseVersionRecord {
  const operationsReleaseId = input.operationsReleaseId.trim();
  const version = input.version.trim();
  const kind = input.kind;

  const release = getOperationsRelease(operationsReleaseId);
  if (!release) {
    throw new Error(`operations release not found: ${operationsReleaseId}`);
  }
  if (!(RELEASE_VERSION_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`invalid version kind: ${kind}`);
  }
  assertSemverLike(version);
  if (input.previousVersion) assertSemverLike(input.previousVersion.trim());

  const pkg = getDeploymentPackage(release.deploymentPackageId);
  if (!pkg) {
    throw new Error(
      `deployment package not found: ${release.deploymentPackageId}`,
    );
  }

  const id = input.id?.trim() || createId("relver");
  if (versions.has(id)) {
    throw new Error(`release version already exists: ${id}`);
  }

  const record: ReleaseVersionRecord = {
    id,
    operationsReleaseId,
    version,
    kind: kind as ReleaseVersionKind,
    previousVersion: input.previousVersion?.trim() || undefined,
    deploymentPackageId: release.deploymentPackageId,
    detail: input.detail?.trim() || `version=${version} kind=${kind}`,
    recordedAt: nowIso(),
  };
  versions.set(id, record);
  bindReleaseVersion(operationsReleaseId, id);
  return cloneVersion(record);
}

export function getReleaseVersion(
  id: string,
): ReleaseVersionRecord | undefined {
  const record = versions.get(id.trim());
  return record ? cloneVersion(record) : undefined;
}

export function listReleaseVersions(filter?: {
  operationsReleaseId?: string;
  kind?: ReleaseVersionKind;
}): ReleaseVersionRecord[] {
  let result = [...versions.values()];
  if (filter?.operationsReleaseId) {
    const rid = filter.operationsReleaseId.trim();
    result = result.filter((v) => v.operationsReleaseId === rid);
  }
  if (filter?.kind) result = result.filter((v) => v.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneVersion);
}

export function getLatestReleaseVersion(
  operationsReleaseId: string,
): ReleaseVersionRecord | undefined {
  return listReleaseVersions({ operationsReleaseId })[0];
}

export function clearReleaseVersions(): void {
  versions.clear();
}
