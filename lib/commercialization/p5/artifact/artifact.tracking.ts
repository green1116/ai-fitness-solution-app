/**
 * Commercialization P5 — Artifact tracking
 */

import { ARTIFACT_STATUSES } from "../delivery/delivery.constants";
import {
  getDeliveryArtifact,
  setArtifactStatus,
} from "./artifact.registry";
import type {
  ArtifactStatus,
  ArtifactTrackingRecord,
  TrackArtifactInput,
} from "./artifact.types";

const tracking = new Map<string, ArtifactTrackingRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTracking(
  record: ArtifactTrackingRecord,
): ArtifactTrackingRecord {
  return { ...record };
}

export function trackArtifact(
  input: TrackArtifactInput,
): ArtifactTrackingRecord {
  const artifactId = input.artifactId.trim();
  const artifact = getDeliveryArtifact(artifactId);
  if (!artifact) throw new Error(`artifact not found: ${artifactId}`);

  const toStatus = input.toStatus;
  if (!(ARTIFACT_STATUSES as readonly string[]).includes(toStatus)) {
    throw new Error(`invalid artifact status: ${toStatus}`);
  }

  const fromStatus = artifact.status;
  setArtifactStatus(artifactId, toStatus);

  const id = input.id?.trim() || createId("atrack");
  if (tracking.has(id)) {
    throw new Error(`artifact tracking record already exists: ${id}`);
  }

  const record: ArtifactTrackingRecord = {
    id,
    artifactId,
    event: (input.event ?? `status-${toStatus.toLowerCase()}`).trim(),
    fromStatus,
    toStatus,
    note: (input.note ?? `track ${fromStatus}→${toStatus}`).trim(),
    trackedAt: nowIso(),
  };
  tracking.set(id, record);
  return cloneTracking(record);
}

export function getArtifactTrackingRecord(
  id: string,
): ArtifactTrackingRecord | undefined {
  const record = tracking.get(id.trim());
  return record ? cloneTracking(record) : undefined;
}

export function listArtifactTrackingRecords(filter?: {
  artifactId?: string;
  toStatus?: ArtifactStatus;
}): ArtifactTrackingRecord[] {
  let result = [...tracking.values()];
  if (filter?.artifactId) {
    const aid = filter.artifactId.trim();
    result = result.filter((r) => r.artifactId === aid);
  }
  if (filter?.toStatus) {
    result = result.filter((r) => r.toStatus === filter.toStatus);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneTracking);
}

export function clearArtifactTrackingRecords(): void {
  tracking.clear();
}
