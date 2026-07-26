/**
 * Product Marketplace Audit — Release manifest + checksum
 */

import { createHash } from "node:crypto";

import { getMarketplaceAuditEvent } from "../event/event.registry";
import { listMarketplaceAuditIntegrities } from "../integrity/integrity.registry";
import { listMarketplaceAuditQueries } from "../query/query.registry";
import { listMarketplaceAuditTrails } from "../trail/trail.registry";

export type MarketplaceAuditReleaseManifest = {
  id: string;
  eventId: string;
  eventKey: string;
  checksum: string;
  trailId: string;
  integrityId: string;
  queryId: string;
  createdAt: string;
};

const releases = new Map<string, MarketplaceAuditReleaseManifest>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRelease(
  release: MarketplaceAuditReleaseManifest,
): MarketplaceAuditReleaseManifest {
  return { ...release };
}

export function createMarketplaceAuditReleaseManifest(input: {
  id?: string;
  eventId: string;
}): MarketplaceAuditReleaseManifest {
  const eventId = input.eventId.trim();
  if (!eventId) throw new Error("manifest.eventId is required");

  const event = getMarketplaceAuditEvent(eventId);
  if (!event) throw new Error(`event not found: ${eventId}`);

  const trails = listMarketplaceAuditTrails({ eventId });
  const sealed = trails.find((t) => t.status === "SEALED");
  if (!sealed) throw new Error("sealed trail missing");

  const integrities = listMarketplaceAuditIntegrities({ trailId: sealed.id });
  const intact = integrities.find((i) => i.verdict === "INTACT");
  if (!intact) throw new Error("intact integrity missing");

  const queries = listMarketplaceAuditQueries();
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

  const id = input.id?.trim() || createId("mpaudrel");
  if (releases.has(id)) throw new Error(`release already exists: ${id}`);

  const release: MarketplaceAuditReleaseManifest = {
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

export function getMarketplaceAuditReleaseManifest(
  id: string,
): MarketplaceAuditReleaseManifest | undefined {
  const release = releases.get(id.trim());
  return release ? cloneRelease(release) : undefined;
}

export function listMarketplaceAuditReleaseManifests(): MarketplaceAuditReleaseManifest[] {
  return [...releases.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRelease);
}

export function clearMarketplaceAuditReleaseManifests(): void {
  releases.clear();
}
