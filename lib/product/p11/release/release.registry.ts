/**
 * Product P11 — Release registry
 */

import { RELEASE_STATUSES } from "./release.constants";
import type {
  CommercialRelease,
  CreateReleaseInput,
  ReleaseStatus,
  UpdateReleaseStatusInput,
} from "./release.types";

const releases = new Map<string, CommercialRelease>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRelease(release: CommercialRelease): CommercialRelease {
  return { ...release, metadata: { ...release.metadata } };
}

export function createRelease(input: CreateReleaseInput): CommercialRelease {
  const subscriptionRef = input.subscriptionRef.trim();
  const name = input.name.trim();
  const owner = input.owner.trim();
  if (!subscriptionRef) throw new Error("release.subscriptionRef is required");
  if (!name) throw new Error("release.name is required");
  if (!owner) throw new Error("release.owner is required");

  const id = input.id?.trim() || createId("p11rel");
  if (releases.has(id)) {
    throw new Error(`release already exists: ${id}`);
  }

  const now = nowIso();
  const status = RELEASE_STATUSES[0];
  const release: CommercialRelease = {
    id,
    subscriptionRef,
    name,
    owner,
    status,
    detail: `status=${status} owner=${owner}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  releases.set(id, release);
  return cloneRelease(release);
}

export function updateReleaseStatus(
  input: UpdateReleaseStatusInput,
): CommercialRelease {
  const releaseId = input.releaseId.trim();
  if (!releaseId) throw new Error("release.releaseId is required");
  if (!(RELEASE_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid release status: ${input.status}`);
  }
  const existing = releases.get(releaseId);
  if (!existing) throw new Error(`release not found: ${releaseId}`);

  const updated: CommercialRelease = {
    ...existing,
    status: input.status,
    detail: `status=${input.status} owner=${existing.owner}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  releases.set(releaseId, updated);
  return cloneRelease(updated);
}

export function getRelease(id: string): CommercialRelease | undefined {
  const release = releases.get(id.trim());
  return release ? cloneRelease(release) : undefined;
}

export function listReleases(filter?: {
  subscriptionRef?: string;
  status?: ReleaseStatus;
}): CommercialRelease[] {
  let result = [...releases.values()];
  if (filter?.subscriptionRef) {
    const sref = filter.subscriptionRef.trim();
    result = result.filter((r) => r.subscriptionRef === sref);
  }
  if (filter?.status) result = result.filter((r) => r.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRelease);
}

export function clearReleases(): void {
  releases.clear();
}
