/**
 * Product Marketplace Surface — placement registry
 */

import { SURFACE_PLACEMENT_KINDS } from "../management/management.constants";
import { getSurfaceCatalog } from "../catalog/catalog.registry";
import { getSurfaceListing } from "../listing/listing.registry";
import type {
  MarketplaceSurfacePlacement,
  RegisterSurfacePlacementInput,
  SurfacePlacementKind,
} from "./placement.types";

const placements = new Map<string, MarketplaceSurfacePlacement>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePlacement(
  placement: MarketplaceSurfacePlacement,
): MarketplaceSurfacePlacement {
  return { ...placement, metadata: { ...placement.metadata } };
}

export function registerSurfacePlacement(
  input: RegisterSurfacePlacementInput,
): MarketplaceSurfacePlacement {
  const catalogId = input.catalogId.trim();
  const listingId = input.listingId.trim();
  const placementKey = input.placementKey.trim().toUpperCase();
  if (!catalogId) throw new Error("placement.catalogId is required");
  if (!listingId) throw new Error("placement.listingId is required");
  if (!placementKey) throw new Error("placement.placementKey is required");
  if (!(SURFACE_PLACEMENT_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid placement kind: ${input.kind}`);
  }

  const catalog = getSurfaceCatalog(catalogId);
  if (!catalog) throw new Error(`catalog not found: ${catalogId}`);
  if (catalog.status !== "ACTIVE") {
    throw new Error(`catalog not active: ${catalogId}`);
  }

  const listing = getSurfaceListing(listingId);
  if (!listing) throw new Error(`listing not found: ${listingId}`);
  if (listing.catalogId !== catalogId) {
    throw new Error(`listing catalog mismatch: ${listingId}`);
  }
  if (listing.status !== "VISIBLE") {
    throw new Error(`listing not visible: ${listingId}`);
  }

  const duplicate = [...placements.values()].find(
    (p) => p.listingId === listingId && p.placementKey === placementKey,
  );
  if (duplicate) {
    throw new Error(`placementKey already exists: ${placementKey}`);
  }

  const id = input.id?.trim() || createId("surfplace");
  if (placements.has(id)) throw new Error(`placement already exists: ${id}`);

  const rank =
    typeof input.rank === "number" && Number.isFinite(input.rank)
      ? Math.max(0, Math.floor(input.rank))
      : 0;

  const placement: MarketplaceSurfacePlacement = {
    id,
    catalogId,
    listingId,
    placementKey,
    kind: input.kind,
    rank,
    detail: `kind=${input.kind} rank=${rank}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  placements.set(id, placement);
  return clonePlacement(placement);
}

export function getSurfacePlacement(
  id: string,
): MarketplaceSurfacePlacement | undefined {
  const placement = placements.get(id.trim());
  return placement ? clonePlacement(placement) : undefined;
}

export function listSurfacePlacements(filter?: {
  catalogId?: string;
  listingId?: string;
  kind?: SurfacePlacementKind;
}): MarketplaceSurfacePlacement[] {
  let result = [...placements.values()];
  if (filter?.catalogId) {
    const catalogId = filter.catalogId.trim();
    result = result.filter((p) => p.catalogId === catalogId);
  }
  if (filter?.listingId) {
    const listingId = filter.listingId.trim();
    result = result.filter((p) => p.listingId === listingId);
  }
  if (filter?.kind) {
    result = result.filter((p) => p.kind === filter.kind);
  }
  return result
    .slice()
    .sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      return a.placementKey.localeCompare(b.placementKey);
    })
    .map(clonePlacement);
}

export function clearSurfacePlacements(): void {
  placements.clear();
}
