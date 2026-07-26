/**
 * Product API Audit — Release manifest + checksum
 */

import { createHash } from "node:crypto";

import { getApiAuditEvent } from "../event/event.registry";
import { listApiAuditIntegrities } from "../integrity/integrity.registry";
import { listApiAuditQueries } from "../query/query.registry";
import { listApiAuditTrails } from "../trail/trail.registry";

export type ApiAuditReleaseManifest = {
  id: string;
  eventId: string;
  eventKey: string;
  checksum: string;
  trailId: string;
  integrityId: string;
  queryId: string;
  createdAt: string;
};

const releases = new Map<string, ApiAuditReleaseManifest>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRelease(
  release: ApiAuditReleaseManifest,
): ApiAuditReleaseManifest {
  return { ...release };
}

export function createApiAuditReleaseManifest(input: {
  id?: string;
  eventId: string;
}): ApiAuditReleaseManifest {
  const eventId = input.eventId.trim();
  if (!eventId) throw new Error("manifest.eventId is required");

  const event = getApiAuditEvent(eventId);
  if (!event) throw new Error(`event not found: ${eventId}`);

  const trails = listApiAuditTrails({ eventId });
  const sealed = trails.find((t) => t.status === "SEALED");
  if (!sealed) throw new Error("sealed trail missing");

  const integrities = listApiAuditIntegrities({ trailId: sealed.id });
  const intact = integrities.find((i) => i.verdict === "INTACT");
  if (!intact) throw new Error("intact integrity missing");

  const queries = listApiAuditQueries();
  if (queries.length < 1) throw new Error("query missing");

  const payload = {
    eventKey: event.eventKey,
    category: event.category,
    severity: event.severity,
    subjectKey: event.subjectKey,
    governanceKeyRef: event.governanceKeyRef,
    trail: { sequence: sealed.sequence, status: sealed.status },
    integrity: { checksum: intact.checksum, verdict: intact.verdict },
    query: {
      queryKey: queries[0].queryKey,
      matched: queries[0].matchedEventIds.length,
    },
  };

  const id = input.id?.trim() || createId("apiaudrel");
  if (releases.has(id)) throw new Error(`release already exists: ${id}`);

  const release: ApiAuditReleaseManifest = {
    id,
    eventId,
    eventKey: event.eventKey,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    trailId: sealed.id,
    integrityId: intact.id,
    queryId: queries[0].id,
    createdAt: nowIso(),
  };
  releases.set(id, release);
  return cloneRelease(release);
}

export function getApiAuditReleaseManifest(
  id: string,
): ApiAuditReleaseManifest | undefined {
  const release = releases.get(id.trim());
  return release ? cloneRelease(release) : undefined;
}

export function listApiAuditReleaseManifests(): ApiAuditReleaseManifest[] {
  return [...releases.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRelease);
}

export function clearApiAuditReleaseManifests(): void {
  releases.clear();
}
