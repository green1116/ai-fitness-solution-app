/**
 * Product Marketplace Surface — Release manifest + checksum
 */

import { createHash } from "node:crypto";

import { getSurfaceCatalog } from "../catalog/catalog.registry";
import { listSurfaceListings } from "../listing/listing.registry";
import { listSurfacePlacements } from "../placement/placement.registry";
import { listSurfaceVisibilities } from "../visibility/visibility.registry";

export type MarketplaceSurfaceReleaseManifest = {
  id: string;
  catalogId: string;
  catalogKey: string;
  checksum: string;
  listingId: string;
  visibilityId: string;
  placementId: string;
  createdAt: string;
};

const releases = new Map<string, MarketplaceSurfaceReleaseManifest>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRelease(
  release: MarketplaceSurfaceReleaseManifest,
): MarketplaceSurfaceReleaseManifest {
  return { ...release };
}

export function createMarketplaceSurfaceReleaseManifest(input: {
  id?: string;
  catalogId: string;
}): MarketplaceSurfaceReleaseManifest {
  const catalogId = input.catalogId.trim();
  if (!catalogId) throw new Error("manifest.catalogId is required");

  const catalog = getSurfaceCatalog(catalogId);
  if (!catalog) throw new Error(`catalog not found: ${catalogId}`);

  const listings = listSurfaceListings({ catalogId });
  const visible = listings.find((l) => l.status === "VISIBLE");
  if (!visible) throw new Error("visible surface listing missing");

  const visibilities = listSurfaceVisibilities({
    catalogId,
    listingId: visible.id,
  });
  if (visibilities.length < 1) throw new Error("surface visibility missing");

  const placements = listSurfacePlacements({
    catalogId,
    listingId: visible.id,
  });
  if (placements.length < 1) throw new Error("surface placement missing");

  const payload = {
    catalogKey: catalog.catalogKey,
    kind: catalog.kind,
    status: catalog.status,
    listing: {
      listingKey: visible.listingKey,
      title: visible.title,
      appKeyRef: visible.appKeyRef,
      status: visible.status,
    },
    visibility: {
      visibilityKey: visibilities[0].visibilityKey,
      mode: visibilities[0].mode,
    },
    placement: {
      placementKey: placements[0].placementKey,
      kind: placements[0].kind,
      rank: placements[0].rank,
    },
  };

  const id = input.id?.trim() || createId("surfrel");
  if (releases.has(id)) throw new Error(`release already exists: ${id}`);

  const release: MarketplaceSurfaceReleaseManifest = {
    id,
    catalogId,
    catalogKey: catalog.catalogKey,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    listingId: visible.id,
    visibilityId: visibilities[0].id,
    placementId: placements[0].id,
    createdAt: nowIso(),
  };
  releases.set(id, release);
  return cloneRelease(release);
}

export function getMarketplaceSurfaceReleaseManifest(
  id: string,
): MarketplaceSurfaceReleaseManifest | undefined {
  const release = releases.get(id.trim());
  return release ? cloneRelease(release) : undefined;
}

export function listMarketplaceSurfaceReleaseManifests(): MarketplaceSurfaceReleaseManifest[] {
  return [...releases.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRelease);
}

export function clearMarketplaceSurfaceReleaseManifests(): void {
  releases.clear();
}
